import path from "path";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express(); // 1ª DECLARAÇÃO (Certa!)

app.use(cors());
app.use(express.json());

// Front-end estático (mesma origem da API: dispensa CORS em produção).
// "frontend" é irmã tanto de "src" (dev) quanto de "dist" (build), então
// o mesmo caminho relativo funciona nos dois cenários.
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use(routes);
app.use(errorHandler);

export default app;