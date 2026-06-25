import {
  PessoaRepository
}
from "../repositories/pessoaRepository";

const repository =
  new PessoaRepository();

export class PessoaService {

  async criarPessoa(
    dados: any
  ) {

    if (!dados.nome) {

      throw new Error(
        "Nome obrigatório"
      );

    }

    if (dados.gestante) {
      if (dados.tempo_gestacao_semanas == null) {
        throw new Error(
          "Tempo de gestação (semanas) é obrigatório quando gestante = true"
        );
      }
    } else {
      dados.tempo_gestacao_semanas = null;
    }

    if (dados.tipo_responsavel === "Membro" && !dados.grau_parentesco) {
      throw new Error(
        "Grau de parentesco é obrigatório para membros da família"
      );
    }

    if (dados.grau_parentesco === "Outro") {
      if (!dados.grau_parentesco_outro) {
        throw new Error(
          "Especifique o grau de parentesco quando selecionar 'Outro'"
        );
      }
    } else {
      dados.grau_parentesco_outro = null;
    }

    if (dados.cpf) {

      const cpfExiste =
        await repository.buscarCpf(
          dados.cpf
        );

      if (cpfExiste) {

        throw new Error(
          "CPF já cadastrado"
        );

      }

    }

    // A integridade referencial de moradia_id é garantida pelo banco de dados

    return repository.criar(
      dados
    );

  }

  async atualizarPessoa(id: string, dados: any) {
    if (dados.cpf) {
      const cpfExiste = await repository.buscarCpf(dados.cpf);
      if (cpfExiste && String(cpfExiste.id) !== String(id)) {
        throw new Error("CPF já cadastrado para outra pessoa");
      }
    }

    const pessoaAtual = await repository.buscarPorId(id);
    if (!pessoaAtual) {
      throw new Error("Pessoa não encontrada");
    }

    const gestante = dados.gestante !== undefined ? dados.gestante : pessoaAtual.gestante;
    if (gestante) {
      const tempo = dados.tempo_gestacao_semanas !== undefined
        ? dados.tempo_gestacao_semanas
        : pessoaAtual.tempo_gestacao_semanas;
      if (tempo == null) {
        throw new Error("Tempo de gestação (semanas) é obrigatório quando gestante = true");
      }
    } else if (dados.gestante !== undefined) {
      dados.tempo_gestacao_semanas = null;
    }

    return repository.atualizar(id, dados);
  }

}