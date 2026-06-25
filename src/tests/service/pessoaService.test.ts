import { PessoaService } from "../../services/pessoaService";
import { PessoaRepository } from "../../repositories/pessoaRepository";

jest.mock("../../repositories/pessoaRepository");

describe("PessoaService - Cobertura Unitária", () => {
  let service: PessoaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PessoaService();
  });

  it("CT01 -> RN01 (Falha): Deve rejeitar a criação se o nome for omitido", async () => {
    const payloadInvalido = { cpf: "12345678901" };
    const acao = service.criarPessoa(payloadInvalido);
    await expect(acao).rejects.toThrow("Nome obrigatório");
  });

  it("CT02 -> RN01 (Falha): Deve impedir a criação se o CPF já estiver cadastrado", async () => {
    const payload = { nome: "João Silva", cpf: "11122233344" };
    jest.spyOn(PessoaRepository.prototype as any, "buscarCpf").mockResolvedValue({ id: "id-existente" } as any);

    const acao = service.criarPessoa(payload);
    await expect(acao).rejects.toThrow("CPF já cadastrado");
  });

  it("CT03 -> RN01 (Sucesso): Deve cadastrar a pessoa com sucesso se os dados forem válidos", async () => {
    const payload = { nome: "João Silva", cpf: "11122233344" };
    jest.spyOn(PessoaRepository.prototype as any, "buscarCpf").mockResolvedValue(null);
    jest.spyOn(PessoaRepository.prototype as any, "criar").mockResolvedValue({ id: "uuid-novo", ...payload } as any);

    const resultado = await service.criarPessoa(payload);
    expect(resultado).toHaveProperty("id", "uuid-novo");
  });

  it("CT04 -> RN01 (Falha/Update): Deve impedir atualização se o novo CPF for de outra pessoa", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarCpf").mockResolvedValue({ id: "outro-usuario", cpf: "99988877766" } as any);

    const acao = service.atualizarPessoa("usuario-atual", { cpf: "99988877766" });
    await expect(acao).rejects.toThrow("CPF já cadastrado para outra pessoa");
  });

  it("CT05 -> RN01 (Falha/Update): Deve lançar erro se a pessoa a ser atualizada não existir", async () => {
    jest.spyOn(PessoaRepository.prototype as any, "buscarCpf").mockResolvedValue(null);
    jest.spyOn(PessoaRepository.prototype as any, "buscarPorId").mockResolvedValue(null);

    const acao = service.atualizarPessoa("id-fantasma", { nome: "Novo Nome" });
    await expect(acao).rejects.toThrow("Pessoa não encontrada");
  });
});