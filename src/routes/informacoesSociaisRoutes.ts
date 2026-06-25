import { Router }
from "express";

import {
  InformacoesSociaisController
}
from "../controllers/informacoesSociaisController";

const router =
  Router();

const controller =
  new InformacoesSociaisController();

router.post(

  "/informacoes-sociais",

  controller.criar

);

export default router;