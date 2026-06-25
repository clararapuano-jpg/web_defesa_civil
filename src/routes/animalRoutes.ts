import { Router } from "express";
import multer from "multer";
import { AnimalController } from "../controllers/animalController";

const router = Router();
const upload = multer();
const controller = new AnimalController();

router.post(
  "/moradias/:id/animais",
  controller.criar
);

router.post(
  "/animais/:id/imagem",
  upload.single("arquivo"),
  controller.uploadImagem
);

export default router;
