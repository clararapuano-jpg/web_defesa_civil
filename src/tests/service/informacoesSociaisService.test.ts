import { InformacoesSociaisService } from "../../services/informacoesSociaisService";
import { InformacoesSociaisRepository } from "../../repositories/informacoesSociaisRepository";
import { PessoaRepository } from "../../repositories/pessoaRepository";

jest.mock("../../repositories/informacoesSociaisRepository");
jest.mock("../../repositories/pessoaRepository");

describe("InformacoesSociaisService - Vínculos Sociais", () => {
  let service: InformacoesSociaisService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InformacoesSociaisService();
  });

  it("CT16 -> Integridade (Falha): Deve impedir criação de info social de pessoa fantasma", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue(null);

    const acao = service.criar({ pessoa_id: "invalido", animais: "Cachorro" });
    await expect(acao).rejects.toThrow("Pessoa não encontrada");
  });

  it("CT17 -> Sucesso: Deve salvar as informações sociais se o dono existir", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue({ id: "pessoa-ok" } as any);
    jest.spyOn(InformacoesSociaisRepository.prototype as any, "criar").mockResolvedValue({ id: "soc-1" } as any);

    const resultado = await service.criar({ pessoa_id: "pessoa-ok", animais: "Cachorro" });
    expect(resultado).toHaveProperty("id", "soc-1");
  });
});