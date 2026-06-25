import { CadastroService } from "../../services/cadastroService";
import { CadastroRepository } from "../../repositories/cadastroRepository";

jest.mock("../../repositories/cadastroRepository");

describe("CadastroService - Filtros e Busca", () => {
  let service: CadastroService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CadastroService();
  });

  it("CT09 -> RN09 (Determinismo): Deve repassar os parâmetros de filtro para o Repositório", async () => {
    const filtros = { bairro: "Centro" };
    const dadosEsperados = [{ id: "1", prioridade: 0 }];
    jest.spyOn(CadastroRepository.prototype as any, "buscarComFiltros").mockResolvedValue(dadosEsperados as any);

    const resultado = await service.buscarComFiltros(filtros);
    expect(resultado).toEqual(dadosEsperados);
    expect(CadastroRepository.prototype.buscarComFiltros).toHaveBeenCalledWith(filtros);
  });

  it("CT10 -> RN21 (Sucesso): Deve buscar a agregação completa por ID", async () => {
    const agregadoMock = { pessoa: {}, moradia: {}, necessidades: {} };
    jest.spyOn(CadastroRepository.prototype as any, "buscarPorId").mockResolvedValue(agregadoMock as any);

    const resultado = await service.buscarPorId("uuid-123");
    expect(resultado).toEqual(agregadoMock);
  });
});