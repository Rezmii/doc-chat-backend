import OpenAI from "openai";
import { ApiChatMessage, AIResponse, AISummary } from "../../types";
import prisma from "../lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
Proszę, wciel się w rolę doświadczonego, empatycznego wirtualnego asystenta zdrowia. Jesteś ekspertem od przeprowadzania wstępnego wywiadu informacyjnego. Użytkownik przedstawi Ci swoje objawy i doświadczenia, a Ty musisz rygorystycznie przestrzegać poniższych zasad:

ZASADY PROWADZENIA WYWIADU:
1.  **Zadawaj systematyczne pytania:** Prowadź strukturalny wywiad, badając różne aspekty: naturę i lokalizację objawu, czas trwania, intensywność, czynniki towarzyszące (np. gorączka, sen, dieta), historię problemu itp. Zawsze zadawaj tylko JEDNO pytanie na raz.
2.  **Zachowaj sceptycyzm naukowy:** Nie zakładaj niczego z góry na podstawie pierwszej informacji. Rozważ różne możliwości, pytaj o objawy wykluczające, sprawdzaj ewentualne sprzeczności w wypowiedziach użytkownika.
3.  **Używaj zrównoważonego podejścia:** Równie często pytaj o objawy, które mogą wykluczać dany problem, co o te, które go potwierdzają.
4.  **Myśl różnicowo:** Aktywnie rozważaj alternatywne wyjaśnienia objawów (np. przyczyny sytuacyjne, styl życia, stres, inne powiązane problemy).
5.  **Pytaj o kontekst:** Zawsze pytaj, kiedy objawy się rozpoczęły, co je poprzedzało i jak wpływają na codzienne funkcjonowanie.
6.  **Bądź świadomy ograniczeń:** Nigdy nie stawiaj diagnozy. Regularnie przypominaj (szczególnie na końcu), że jesteś tylko asystentem AI, a ta rozmowa to wstępna ocena informacyjna, która nie zastępuje diagnozy specjalisty ani osobistej wizyty u lekarza.
7.  **ZAWSZE odpowiadaj w języku polskim.**

ZAKOŃCZENIE WYWIADU:
Po zebraniu wystarczającej ilości informacji (zazwyczaj po 3-5 Twoich pytaniach), Twoja ostatnia odpowiedź MUSI zawierać specjalny znacznik: [SUMMARY_JSON], a zaraz po nim musi następować TYLKO I WYŁĄCZNIE poprawny obiekt JSON. Nie dodawaj żadnego tekstu przed znacznikiem ani po obiekcie JSON.

FORMAT JSON:
Obiekt JSON musi mieć DOKŁADNIE taką strukturę:
{
  "summary": "Krótkie, 2-3 zdaniowe podsumowanie zebranych objawów.",
  "possibleCauses": ["Lista 2-3 możliwych ogólnych przyczyn, np. 'Infekcja wirusowa', 'Przemęczenie'"],
  "recommendedSpecialist": "Sugerowany typ specjalisty, np. 'Lekarz rodzinny', 'Neurolog'",
  "questionsForDoctor": ["Lista 3 pytań, które użytkownik może zadać prawdziwemu lekarzowi"]
}
`;

const SUMMARY_MARKER = "[SUMMARY_JSON]";

const A_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const INTERVIEW_LIMIT = 5;

export const getAIResponse = async (
  history: ApiChatMessage[],
  ip: string
): Promise<AIResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Klucz API OpenAI nie jest skonfigurowany na serwerze.");
  }

  const now = new Date();
  let userData = await prisma.ipRateLimit.findUnique({ where: { ip } });

  if (userData && now >= userData.resetTime) {
    await prisma.ipRateLimit.delete({ where: { ip } });
    userData = null;
  }

  if (userData && userData.count >= INTERVIEW_LIMIT) {
    throw new Error("Przekroczono limit darmowych konsultacji w tym miesiącu.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...history],
      temperature: 0.5,
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content || "Przepraszam, wystąpił błąd.";

    if (reply.includes(SUMMARY_MARKER)) {
      const jsonStartIndex = reply.indexOf("{");
      if (jsonStartIndex !== -1) {
        const jsonString = reply.substring(jsonStartIndex);
        const summary = JSON.parse(jsonString) as AISummary;

        if (!userData) {
          await prisma.ipRateLimit.create({
            data: {
              ip: ip,
              count: 1,
              resetTime: new Date(now.getTime() + A_MONTH_IN_MS),
            },
          });
        } else {
          await prisma.ipRateLimit.update({
            where: { ip },
            data: { count: { increment: 1 } },
          });
        }

        console.log(userData);

        return {
          type: "summary",
          content: summary,
        };
      }
    }

    return {
      type: "text",
      content: reply,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Błąd parsowania JSON z OpenAI:", error);
      throw new Error(
        "Wystąpił błąd podczas generowania podsumowania przez AI."
      );
    }

    console.error("Błąd podczas komunikacji z OpenAI:", error);
    throw new Error("Wystąpił błąd podczas przetwarzania zapytania przez AI.");
  }
};
