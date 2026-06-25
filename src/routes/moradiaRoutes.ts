import { Router }
from "express";

import {
  MoradiaController
}
from "../controllers/moradiaController";

const router =
  Router();

const controller =
  new MoradiaController();

router.post(

  "/moradias",

  controller.criar

);

router.patch(

  "/moradias/:id",

  controller.atualizar

);

router.delete(

  "/cadastros/:id",

  controller.excluir

);

export default router;