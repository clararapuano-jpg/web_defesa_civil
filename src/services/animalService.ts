import { supabase } from "../config/supabase";
import { AnimalRepository } from "../repositories/animalRepository";
import { MoradiaRepository } from "../repositories/moradiaRepository";

const repository = new AnimalRepository();
const moradiaRepository = new MoradiaRepository();

export class AnimalService {
  async criar(moradiaId: string, dados: any) {
    const moradia = await moradiaRepository.buscarPorId(moradiaId);
    if (!moradia) {
      throw new Error("Moradia não encontrada");
    }

    return repository.criar({
      ...dados,
      moradia_id: moradiaId,
    });
  }

  async uploadImagem(file: any, animalId: string) {
    const animal = await repository.buscarPorId(animalId);
    if (!animal) {
      throw new Error("Animal não encontrado");
    }

    const nomeArquivo = `${Date.now()}-animal-${animalId}-${file.originalname}`;
    const { error } = await supabase.storage
      .from("imagens")
      .upload(nomeArquivo, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    return repository.atualizarFoto(animalId, {
      arquivo: nomeArquivo,
      nome_original: file.originalname,
      tipo_arquivo: file.mimetype,
      tamanho: file.size,
    });
  }
}
