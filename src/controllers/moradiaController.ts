import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  moradiaSchema,
  moradiaUpdateSchema
}
from "../schemas/moradiaSchema";

import {
  MoradiaService
}
from "../services/moradiaService";

const service =
  new MoradiaService();

export class MoradiaController {

  async criar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      const dados =
        moradiaSchema.parse(
          req.body
        );

      const moradia =
        await service.criar(
          dados
        );

      return res
        .status(201)
        .json(moradia);

    }

    catch (error) {
      next(error);
    }

  }

  async excluir(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      await service.excluir(id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async atualizar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dados = moradiaUpdateSchema.parse(req.body);
      const id = String(req.params.id);
      const moradia = await service.atualizar(id, dados);
      return res.status(200).json(moradia);
    } catch (error) {
      next(error);
    }
  }

}