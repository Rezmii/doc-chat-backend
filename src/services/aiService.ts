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

export const getAIResponse = async (
  history: ApiChatMessage[]
): Promise<AIResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Klucz API OpenAI nie jest skonfigurowany na serwerze.");
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
      const jsonString = reply.substring(SUMMARY_MARKER.length);
      const summary = JSON.parse(jsonString) as AISummary;

      return {
        type: "summary",
        content: summary,
      };
    } else {
      return {
        type: "text",
        content: reply,
      };
    }
  } catch (error) {
    console.error("Błąd podczas komunikacji z OpenAI lub parsowania:", error);
    throw new Error("Wystąpił błąd podczas przetwarzania zapytania przez AI.");
  }
};
