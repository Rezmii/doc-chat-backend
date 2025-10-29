import { Router, Request, Response } from "express";
import { getAIResponse } from "../services/aiService";

const router = Router();

router.post("/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const history = req.body.history;
    const ip = req.ip;
    if (!history) {
      res.status(400).json({ error: "Brak historii czatu." });
      return;
    }
    if (!ip) {
      res.status(400).json({ error: "Nie można zidentyfikować adresu IP." });
      return;
    }

    const aiResponse = await getAIResponse(history, ip);
    res.json(aiResponse);
  } catch (error: any) {
    console.error("Błąd w aiRoutes:", error);

    if (error.message.includes("Przekroczono limit")) {
      res.status(429).send(error.message);
    } else {
      res.status(500).json({ error: "Wystąpił błąd serwera AI." });
    }
  }
});

export default router;
