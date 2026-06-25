import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  necessidadeSchema
}
from "../schemas/necessidadeSchema";

import {
  NecessidadeService
}
from "../services/necessidadeService";

const service =
  new NecessidadeService();

export class NecessidadeController {

  async criar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      const dados =
        necessidadeSchema.parse(
          req.body
        );

      const necessidade =
        await service.criar(
          dados
        );

      return res
        .status(201)
        .json(necessidade);

    }

    catch (error) {
      next(error);
    }

  }

}