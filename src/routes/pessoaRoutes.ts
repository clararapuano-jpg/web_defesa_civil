import { Router }
from "express";

import {
  PessoaController
}
from "../controllers/pessoaController";

const router =
  Router();

const controller =
  new PessoaController();

router.post(

  "/pessoas",

  controller.criar

);

router.post(

  "/pessoas/:id/membros",

  controller.adicionarMembro

);

router.patch(

  "/pessoas/:id",

  controller.atualizar

);

export default router;