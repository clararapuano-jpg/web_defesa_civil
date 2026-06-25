import { NecessidadeService } from "../../services/necessidadeService";
import { NecessidadeRepository } from "../../repositories/necessidadeRepository";
import { PessoaRepository } from "../../repositories/pessoaRepository";

jest.mock("../../repositories/necessidadeRepository");
jest.mock("../../repositories/pessoaRepository");

describe("NecessidadeService - Cadastro Específico", () => {
  let service: NecessidadeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NecessidadeService();
  });

  it("CT14 -> Integridade (Falha): Deve garantir que a pessoa existe antes de inserir", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue(null);

    const acao = service.criar({ pessoa_id: "id-invalido", idosos: true });
    await expect(acao).rejects.toThrow("Pessoa não encontrada");
  });

  it("CT15 -> Sucesso: Deve inserir os dados de vulnerabilidade com sucesso", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue({ id: "pessoa-ok" } as any);
    jest.spyOn(NecessidadeRepository.prototype as any, "criar").mockResolvedValue({ id: "nec-1" } as any);

    const resultado = await service.criar({ pessoa_id: "pessoa-ok", idosos: true });
    expect(resultado).toHaveProperty("id", "nec-1");
  });
});