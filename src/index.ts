import express, { Request, Response } from "express";
import doctorRoutes from "./api/doctorRoutes";
import aiRoutes from "./api/aiRoutes";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Serwer backendu aplikacji medycznej działa!");
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/ai", aiRoutes);

app.listen(port, () => {
  console.log(`🚀 Serwer uruchomiony na http://localhost:${port}`);
});
