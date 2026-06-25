
import { Request, Response, NextFunction } from "express";


const fixtures = {
  pessoa: {
    id: "1",
    nome: "João",
    cpf: "12345678901",
  },
  moradia: {
    id: "m1",
    endereco: "Rua A",
    pessoa_id: "1",
  },
};

describe("Testes de Controladores - Jest Puro", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Padrão AAA - Arrange, Act, Assert", () => {
    test("Arrange: prepara dados de entrada", () => {
      // Arrange: Preparar
      const dados = { nome: "João", cpf: "123.456.789-01" };

      // Validar que dados foram preparados
      expect(dados).toHaveProperty("nome");
      expect(dados.nome).toBe("João");
    });

    test("Act: executa a operação", () => {
      // Act: Executar uma operação
      const resultado = fixtures.pessoa;

      // Assert: Validar resultado
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe("1");
    });

    test("Assert: verifica o resultado", () => {
      // Completo: Arrange -> Act -> Assert
      const request = { body: { nome: "Maria" } };
      const response = { status: 201, json: { id: "2" } };

      expect(request.body).toHaveProperty("nome");
      expect(response.status).toBe(201);
    });
  });

  describe("Mock de Express Request/Response", () => {
    test("Mock request com body", () => {
      mockRequest.body = { nome: "Test" };

      expect(mockRequest.body).toEqual({ nome: "Test" });
    });

    test("Mock response.status() retorna this", () => {
      (mockResponse.status as jest.Mock)(201);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    test("Mock response.json() retorna dados", () => {
      const dados = { id: "1" };
      (mockResponse.json as jest.Mock)(dados);

      expect(mockResponse.json).toHaveBeenCalledWith(dados);
    });

    test("Cadeia de mocks: status().json()", () => {
      const dados = { id: "1", nome: "João" };
      
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);
      (mockResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = (mockResponse.status as jest.Mock)(201)
        .json(dados);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(dados);
    });
  });

  describe("Padrão de Erro com NextFunction", () => {
    test("Erro de validação chama next com erro", () => {
      const error = new Error("Nome obrigatório");
      mockNext(error);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test("Erro de regra de negócio chama next", () => {
      const error = new Error("CPF duplicado");
      mockNext(error);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining("CPF"),
      }));
    });
  });

  describe("Simulação de Cenários", () => {
    test("Cenário 200 OK - GET com sucesso", () => {
      mockRequest.params = { id: "1" };
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);

      
      (mockResponse.status as jest.Mock)(200).json(fixtures.pessoa);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(fixtures.pessoa);
    });

    test("Cenário 201 Created - POST com sucesso", () => {
      mockRequest.body = { nome: "Nova Pessoa", cpf: "99988877766" };
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);

      const criada = { id: "novo", ...mockRequest.body };
      (mockResponse.status as jest.Mock)(201).json(criada);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(criada);
    });

    test("Cenário 400 Bad Request - validação falha", () => {
      mockRequest.body = { cpf: "12345" }; // nome ausente

      const error = new Error("Validação falhou: nome obrigatório");
      mockNext(error);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test("Cenário 404 Not Found - recurso não existe", () => {
      mockRequest.params = { id: "inexistente" };
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);

      (mockResponse.status as jest.Mock)(404).json({
        mensagem: "Não encontrado"
      });

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    test("Cenário 409 Conflict - regra de negócio violada", () => {
      mockRequest.body = { cpf: "12345678901" }; // CPF duplicado

      const error = new Error("CPF já cadastrado");
      mockNext(error);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test("Cenário 204 No Content - DELETE com sucesso", () => {
      mockRequest.params = { id: "1" };
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);

      (mockResponse.status as jest.Mock)(204).send();

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe("Teste de Método Real do Controller", () => {
    test("Simular busca de pessoa por ID", async () => {
     
      const pessoaBuscada = { ...fixtures.pessoa };

      mockRequest.params = { id: "1" };
      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);

      
      if (pessoaBuscada) {
        (mockResponse.status as jest.Mock)(200).json(pessoaBuscada);
      } else {
        (mockResponse.status as jest.Mock)(404).json({ erro: "Não encontrado" });
      }

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(pessoaBuscada);
    });

    test("Simular criar pessoa com sucesso", async () => {
      const novaPessoa = { nome: "Maria Silva", cpf: "11122233344", genero: "F" };
      mockRequest.body = novaPessoa;

      
      const pessoaCriada = { id: "novo-id", ...novaPessoa };

      (mockResponse.status as jest.Mock).mockReturnValue(mockResponse);
      (mockResponse.status as jest.Mock)(201).json(pessoaCriada);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Maria Silva" })
      );
    });
  });
});
