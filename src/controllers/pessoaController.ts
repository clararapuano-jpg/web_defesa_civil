import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  pessoaSchema,
  pessoaUpdateSchema
}
from "../schemas/pessoaSchema";

import {
  PessoaService
}
from "../services/pessoaService";
import { PessoaRepository } from "../repositories/pessoaRepository";

const service =
  new PessoaService();
const repository = new PessoaRepository();

export class PessoaController {

  async criar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      const dados =
        pessoaSchema.parse(
          req.body
        );

      const pessoa =
        await service.criarPessoa(
          dados
        );

      return res
        .status(201)
        .json(pessoa);

    }

    catch (error) {
      next(error);
    }

  }

  async adicionarMembro(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      const dados =
        pessoaSchema.parse(
          req.body
        );

      const responsavelId = String(req.params.id);
      const responsavel = await repository.buscarPorId(responsavelId);

      if (!responsavel || !responsavel.moradia_id) {
        return res.status(400).json({ error: "Responsável não encontrado ou não possui moradia vinculada" });
      }

      dados.moradia_id = responsavel.moradia_id;


      dados.tipo_responsavel =
        "Membro";

      const membro =
        await service.criarPessoa(
          dados
        );

      return res
        .status(201)
        .json(membro);

    }

    catch (error) {
      next(error);
    }

  }

  async atualizar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dados = pessoaUpdateSchema.parse(req.body);
      const id = String(req.params.id);

      const pessoaAtualizada = await service.atualizarPessoa(id, dados);
      
      return res.status(200).json(pessoaAtualizada);
    } catch (error) {
      next(error);
    }
  }

}