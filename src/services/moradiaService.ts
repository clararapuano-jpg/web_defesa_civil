import {
  MoradiaRepository
}
from "../repositories/moradiaRepository";

import {
  PessoaRepository
}
from "../repositories/pessoaRepository";

import { pool } from "../config/database";

const repository =
  new MoradiaRepository();

const pessoaRepository =
  new PessoaRepository();

export class MoradiaService {

  async criar(
    dados: any
  ) {

    const pessoa =
      await pessoaRepository.buscarPorId(
        dados.pessoa_id
      );

    if (!pessoa) {

      throw new Error(
        "Pessoa não encontrada"
      );

    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const moradia = await repository.criar(dados, client);
      await pessoaRepository.atualizarMoradia(dados.pessoa_id, moradia.id, client);
      await client.query("COMMIT");
      return moradia;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  }

  async excluir(id: string) {
    const moradia = await repository.excluir(id);
    if (!moradia) {
      throw new Error("Moradia não encontrada ou já excluída");
    }
    return moradia;
  }

  async atualizar(id: string, dados: any) {
    const moradia = await repository.buscarPorId(id);
    if (!moradia) {
      throw new Error("Moradia não encontrada");
    }
    if (moradia.deletedAt) {
      throw new Error("Moradia excluída não pode ser editada");
    }
    return repository.atualizar(id, dados);
  }

}