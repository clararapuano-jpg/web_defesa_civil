import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  ImagemService
}
from "../services/imagemService";

const service =
  new ImagemService();

export class ImagemController {

  async upload(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {

      if (!req.file) {

        throw new Error(
          "Imagem obrigatória"
        );

      }

      const imagem =
        await service.upload(

        req.file,

        String(req.params.id)

  );

      return res
        .status(201)
        .json(imagem);

    }

    catch (error) {
      next(error);
    }

  }

}