import {
  InformacoesSociaisRepository
}
from "../repositories/informacoesSociaisRepository";

import {
  PessoaRepository
}
from "../repositories/pessoaRepository";

const repository =
  new InformacoesSociaisRepository();

const pessoaRepository =
  new PessoaRepository();

export class InformacoesSociaisService {

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