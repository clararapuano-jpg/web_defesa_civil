import { supabase }
from "../config/supabase";

import {
  ImagemRepository
}
from "../repositories/imagemRepository";

import {
  MoradiaRepository
}
from "../repositories/moradiaRepository";

const repository =
  new ImagemRepository();

const moradiaRepository =
  new MoradiaRepository();

export class ImagemService {

  async upload(

    file: any,

    moradiaId: string

  ) {

    if (!file) {

      throw new Error(
        "Imagem obrigatória"
      );

    }

    const nomeArquivo =

      `${Date.now()}-${file.originalname}`;

    const { error } =

      await supabase.storage
        .from("imagens")
        .upload(

          nomeArquivo,

          file.buffer,

          {
            contentType:
              file.mimetype
          }

        );

    if (error) {

      throw new Error(
        error.message
      );

    }

    return repository.criar({

      moradia_id:
        moradiaId,

      arquivo:
        nomeArquivo,

      nome_original:
        file.originalname,

      tipo_arquivo:
        file.mimetype,

      tamanho:
        file.size

    });

  }

}