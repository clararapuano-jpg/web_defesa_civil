import { ImagemService } from "../../services/imagemService";
import { ImagemRepository } from "../../repositories/imagemRepository";
import { supabase } from "../../config/supabase";

jest.mock("../../repositories/imagemRepository");
jest.mock("../../config/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn()
    }
  }
}));

describe("ImagemService - Upload Externo e Resiliência", () => {
  let service: ImagemService;
  let mockUpload: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImagemService();
    
    mockUpload = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload
    });
  });

  it("CT11 -> RN12 (Falha): Deve barrar a operação se nenhum arquivo for anexado", async () => {
    const acao = service.upload(null, "moradia-123");
    await expect(acao).rejects.toThrow("Imagem obrigatória");
  });

  it("CT12 -> RN12 (Falha Externa): Deve abortar e não sujar o banco se o Supabase cair", async () => {
    const mockFile = { originalname: "foto.png", buffer: Buffer.from(""), mimetype: "image/png" };
    mockUpload.mockResolvedValue({
      data: null,
      error: { message: "Erro no Bucket AWS" }
    });

    const acao = service.upload(mockFile, "moradia-123");
    await expect(acao).rejects.toThrow("Erro no Bucket AWS");
    expect(ImagemRepository.prototype.criar).not.toHaveBeenCalled();
  });

  it("CT13 -> RN12 (Sucesso): Deve criar o registro no banco se a nuvem responder com sucesso", async () => {
    const mockFile = { originalname: "foto.png", buffer: Buffer.from(""), mimetype: "image/png" };
    mockUpload.mockResolvedValue({ data: {}, error: null });
    jest.spyOn(ImagemRepository.prototype as any, "criar").mockResolvedValue({ id: "img-1" } as any);

    const resultado = await service.upload(mockFile, "moradia-123");
    expect(resultado).toHaveProperty("id", "img-1");
  });
});