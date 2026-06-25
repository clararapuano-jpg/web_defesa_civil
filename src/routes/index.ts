import { Router }
from "express";

import pessoaRoutes
from "./pessoaRoutes";

import moradiaRoutes
from "./moradiaRoutes";

import necessidadeRoutes
from "./necessidadeRoutes";

import informacoesSociaisRoutes
from "./informacoesSociaisRoutes";

import animalRoutes
from "./animalRoutes";

import imagemRoutes
from "./imagemRoutes";

import cadastroRoutes
from "./cadastroRoutes";

const router =
  Router();

router.use(
  pessoaRoutes
);

router.use(
  cadastroRoutes
);

router.use(
  moradiaRoutes
);

router.use(
  necessidadeRoutes
);

router.use(
  informacoesSociaisRoutes
);

router.use(
  animalRoutes
);

router.use(
  imagemRoutes
);

export default router;