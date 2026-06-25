import {
  NecessidadeRepository
}
from "../repositories/necessidadeRepository";

import {
  PessoaRepository
}
from "../repositories/pessoaRepository";

const repository =
  new NecessidadeRepository();

const pessoaRepository =
  new PessoaRepository();

export class NecessidadeService {

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

    return repository.criar(
      dados
    );

  }

}