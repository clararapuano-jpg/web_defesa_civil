import { Router }
from "express";

import {
  NecessidadeController
}
from "../controllers/necessidadeController";

const router =
  Router();

const controller =
  new NecessidadeController();

router.post(

  "/necessidades",

  controller.criar

);

export default router;