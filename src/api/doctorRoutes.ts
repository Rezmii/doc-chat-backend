import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const specialties = req.query.specialties as string;

  try {
    const doctors = await prisma.doctor.findMany({
      where: specialties
        ? {
            specialty: {
              in: specialties.split(","),
            },
          }
        : {},
      include: {
        user: true,
      },
    });
    res.json(doctors);
  } catch (error) {
    console.error("Błąd podczas pobierania lekarzy:", error);
    res.status(500).json({ error: "Nie udało się pobrać danych lekarzy." });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
      },
    });

    if (!doctor) {
      res.status(404).json({ error: "Nie znaleziono lekarza" });
    } else {
      res.json(doctor);
    }
  } catch (error) {
    console.error(`Błąd podczas pobierania lekarza o ID ${id}:`, error);
    res.status(500).json({ error: "Nie udało się pobrać danych lekarza." });
  }
});

export default router;
