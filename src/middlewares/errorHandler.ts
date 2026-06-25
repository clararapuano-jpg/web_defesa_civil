import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  // Se for um erro de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      erro: "Erro de validação nos campos informados",
      detalhes: error.issues.map((err: any) => ({
        campo: err.path.join("."),
        mensagem: err.message
      }))
    });
  }

  return res.status(400).json({
    erro: error.message || "Erro interno"
  });
}