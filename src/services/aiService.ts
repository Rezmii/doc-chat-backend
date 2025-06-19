import OpenAI from "openai";

// Inicjalizujemy klienta OpenAI, który automatycznie odczyta klucz z .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
  Jesteś pomocnym, ale przede wszystkim ostrożnym, wirtualnym asystentem medycznym.
  Twoim celem jest zrozumienie objawów użytkownika i pokierowanie go do odpowiedniego typu specjalisty.

  Twoje najważniejsze zasady to:
  1.  NIGDY nie stawiaj diagnozy. Nie jesteś lekarzem.
  2.  NIGDY nie sugeruj konkretnych leków, dawek ani metod leczenia.
  3.  ZAWSZE na początku rozmowy i przy każdej sugestii podkreślaj, że jesteś tylko asystentem AI, a Twoje sugestie nie zastąpią wizyty u prawdziwego lekarza.
  4.  Bądź empatyczny, rzeczowy i zadawaj pytania, aby doprecyzować problem. Zadawaj jedno pytanie na raz.
  5.  Jeśli uznasz, że masz wystarczająco informacji, aby zasugerować specjalizację (np. "Neurolog", "Kardiolog", "Endokrynolog"), zakończ swoją wiadomość specjalnym znacznikiem: [RECOMMENDATION_READY]. Nie dodawaj nic po tym znaczniku.
`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const getAIChatResponse = async (history: ChatMessage[]) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...history],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Błąd podczas komunikacji z OpenAI API:", error);
    throw new Error("Nie udało się uzyskać odpowiedzi od asystenta AI.");
  }
};
