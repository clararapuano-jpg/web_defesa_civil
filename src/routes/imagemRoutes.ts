import { Router }
from "express";

import multer
from "multer";

import {
  ImagemController
}
from "../controllers/imagemController";

const router =
  Router();

const upload =
  multer();

const controller =
  new ImagemController();

router.post(

  "/imagens/:id",

  upload.single("arquivo"),

  controller.upload

);

export default router;