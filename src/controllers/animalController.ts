import { Request, Response, NextFunction } from "express";
import { animalSchema } from "../schemas/animalSchema";
import { AnimalService } from "../services/animalService";

const service = new AnimalService();

export class AnimalController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = animalSchema.parse(req.body);
      const animal = await service.criar(String(req.params.id), dados);
      return res.status(201).json(animal);
    } catch (error) {
      next(error);
    }
  }

  async uploadImagem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error("Imagem obrigatória");
      }

      const animal = await service.uploadImagem(req.file, String(req.params.id));
      return res.status(201).json(animal);
    } catch (error) {
      next(error);
    }
  }
}
