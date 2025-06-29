import { Router, Request, Response } from "express";
import { getAIChatResponse } from "../services/aiService";

const router = Router();

router.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    res.status(400).json({ error: "Nieprawidłowy format historii czatu." });
  }

  try {
    const aiMessage = await getAIChatResponse(history);

    if (!aiMessage) {
      throw new Error("Otrzymano pustą odpowiedź od AI.");
    }

    const recommendationMatch = aiMessage.match(
      /\[SPECIALIZATIONS:\s*([^\]]+)\]/
    );
    let specializations: string[] = [];
    let responseText = aiMessage;

    if (recommendationMatch && recommendationMatch[1]) {
      specializations = recommendationMatch[1].split(",").map((s) => s.trim());
      responseText = aiMessage.replace(recommendationMatch[0], "").trim();
    }

    res.json({
      reply: responseText,
      specializations: specializations,
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd po stronie serwera AI." });
  }
});

export default router;
