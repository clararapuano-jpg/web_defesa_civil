import { Request, Response } from "express";
import { CadastroService } from "../services/cadastroService";

const service = new CadastroService();

export class CadastroController {
  async buscarComFiltros(req: Request, res: Response): Promise<Response | void> {
    try {
      const filtros = {
        bairro:       req.query.bairro       as string | undefined,
        faixa_etaria: req.query.faixa_etaria as string | undefined,
        deficiencias: req.query.deficiencias as string | undefined
      };

      const dados = await service.buscarComFiltros(filtros);

      if (dados.length === 0) {
        return res.status(200).json({
          mensagem: "Nenhum cadastro encontrado para os filtros aplicados.",
          dados: []
        });
      }

      return res.status(200).json({ dados });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro interno ao executar a busca com filtros."
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<Response | void> {
    try {
      const id = req.params.id as string;
      
      const cadastro = await service.buscarPorId(id);
      
      // RN21: 404 se cadastro não existe ou se a moradia foi excluída logicamente
      if (!cadastro || (cadastro.moradia !== null && cadastro.moradia.deletedAt != null)) {
        return res.status(404).json({
          mensagem: "Cadastro não encontrado ou já foi excluído."
        });
      }

      return res.status(200).json(cadastro);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro interno no servidor ao tentar buscar o cadastro."
      });
    }
  }
}
