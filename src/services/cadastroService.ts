import { CadastroRepository } from "../repositories/cadastroRepository";

const repository = new CadastroRepository();

export class CadastroService {
  async buscarComFiltros(filtros: {
    bairro?: string;
    faixa_etaria?: string;
    deficiencias?: string;
  }) {
    return repository.buscarComFiltros(filtros as any);
  }

  async buscarPorId(id: string) {
    return repository.buscarPorId(id);
  }
}
