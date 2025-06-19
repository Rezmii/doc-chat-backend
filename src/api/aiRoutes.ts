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

    let responseText = aiMessage;
    let recommendationReady = false;

    if (aiMessage?.includes("[RECOMMENDATION_READY]")) {
      recommendationReady = true;
      responseText = aiMessage.replace("[RECOMMENDATION_READY]", "").trim();
    }

    res.json({
      reply: responseText,
      recommendationReady: recommendationReady,
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd po stronie serwera AI." });
  }
});

export default router;
