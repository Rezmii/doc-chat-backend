import OpenAI from "openai";
import { ApiChatMessage, AIResponse, AISummary } from "../../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
Jesteś empatycznym i profesjonalnym wirtualnym asystentem medycznym. Twoim celem jest przeprowadzenie wstępnego wywiadu z użytkownikiem.

ZASADY DZIAŁANIA:
1.  **PROWADŹ WYWIAD:** Zawsze zadawaj tylko JEDNO pytanie na raz.
2.  **NIE STAWIAJ DIAGNOZY.** Zawsze podkreślaj, że jesteś tylko asystentem AI.
3.  **ZAKOŃCZENIE WYWIADU:** Po zebraniu wystarczającej ilości informacji (zazwyczaj 3-5 pytań), Twoja ostatnia odpowiedź MUSI zaczynać się od specjalnego znacznika: [SUMMARY_JSON], a zaraz po nim musi następować TYLKO I WYŁĄCZNIE poprawny obiekt JSON.
4.  **FORMAT JSON:** Obiekt JSON musi mieć DOKŁADNIE taką strukturę:
    {
      "summary": "Krótkie, 2-3 zdaniowe podsumowanie zebranych objawów.",
      "possibleCauses": ["Lista 2-3 możliwych ogólnych przyczyn, np. 'Infekcja wirusowa', 'Przemęczenie'"],
      "recommendedSpecialist": "Sugerowany typ specjalisty, np. 'Lekarz rodzinny', 'Neurolog'",
      "questionsForDoctor": ["Lista 3 pytań, które użytkownik może zadać prawdziwemu lekarzowi"]
    }
5.  **ZAWSZE odpowiadaj w języku polskim.**
`;

const SUMMARY_MARKER = "[SUMMARY_JSON]";

const interviewCounts = new Map<string, { count: number; resetTime: number }>();
const A_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const INTERVIEW_LIMIT = 5;

export const getAIResponse = async (
  history: ApiChatMessage[],
  ip: string
): Promise<AIResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Klucz API OpenAI nie jest skonfigurowany na serwerze.");
  }

  const now = Date.now();
  let userData = interviewCounts.get(ip);

  if (userData && now >= userData.resetTime) {
    interviewCounts.delete(ip);
    userData = undefined;
  }

  if (userData && userData.count >= INTERVIEW_LIMIT) {
    throw new Error("Przekroczono limit darmowych konsultacji w tym miesiącu.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
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
          interviewCounts.set(ip, { count: 1, resetTime: now + A_MONTH_IN_MS });
        } else {
          userData.count++;
        }

        console.log(userData, interviewCounts);

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
