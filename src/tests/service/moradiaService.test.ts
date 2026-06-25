import { MoradiaService } from "../../services/moradiaService";
import { MoradiaRepository } from "../../repositories/moradiaRepository";
import { PessoaRepository } from "../../repositories/pessoaRepository";
import { pool } from "../../config/database";

jest.mock("../../repositories/moradiaRepository");
jest.mock("../../repositories/pessoaRepository");
jest.mock("../../config/database", () => ({
  pool: { connect: jest.fn() }
}));

describe("MoradiaService - Transações e Integridade", () => {
  let service: MoradiaService;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MoradiaService();
    
    mockClient = { query: jest.fn(), release: jest.fn() };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  it("CT06 -> RN21 (Falha): Deve abortar a criação se a pessoa não for encontrada", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue(null);

    const acao = service.criar({ pessoa_id: "fake-id", endereco: "Rua X" });
    await expect(acao).rejects.toThrow("Pessoa não encontrada");
  });

  it("CT07 -> RN21 (Falha Transacional): Deve executar ROLLBACK se o update na pessoa falhar", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue({ id: "p-1" } as any);
    jest.spyOn(MoradiaRepository.prototype as any, "criar").mockResolvedValue({ id: "m-1" } as any);
    jest.spyOn(PessoaRepository.prototype as any, "atualizarMoradia").mockRejectedValue(new Error("Erro de FK"));

    const acao = service.criar({ pessoa_id: "p-1", endereco: "Rua X" });
    await expect(acao).rejects.toThrow("Erro de FK");
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("CT08 -> RN21 (Sucesso Transacional): Deve dar COMMIT se tudo for inserido com sucesso", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue({ id: "p-1" } as any);
    jest.spyOn(MoradiaRepository.prototype as any, "criar").mockResolvedValue({ id: "m-1" } as any);
    jest.spyOn(PessoaRepository.prototype as any, "atualizarMoradia").mockResolvedValue({ id: "p-1" } as any);

    const resultado = await service.criar({ pessoa_id: "p-1", endereco: "Rua X" });
    expect(resultado).toHaveProperty("id", "m-1");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});