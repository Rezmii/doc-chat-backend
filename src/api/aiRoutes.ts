import { Router, Request, Response } from "express";
import { getAIResponse } from "../services/aiService";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/chat",
  rateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const history = req.body.history;
      if (!history) {
        res.status(400).json({ error: "Brak historii czatu." });
        return;
      }

      const aiResponse = await getAIResponse(history);
      res.json(aiResponse);
    } catch (error) {
      console.error("Błąd w aiRoutes:", error);
      res.status(500).json({ error: "Wystąpił błąd serwera." });
    }
  }
);

export default router;
