import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  informacoesSociaisSchema
}
from "../schemas/informacoesSociaisSchema";

import {
  InformacoesSociaisService
}
from "../services/informacoesSociaisService";

const service =
  new InformacoesSociaisService();

export class InformacoesSociaisController {

  async criar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      const dados =
        informacoesSociaisSchema.parse(
          req.body
        );

      const informacao =
        await service.criar(
          dados
        );

      return res
        .status(201)
        .json(informacao);

    }

    catch (error) {
      next(error);
    }

  }

}