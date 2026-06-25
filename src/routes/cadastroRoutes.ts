import { Router } from "express";
import { CadastroController } from "../controllers/cadastroController";

const router = Router();
const controller = new CadastroController();

/**
 * @swagger
 * /cadastros/filtros:
 *   get:
 *     summary: Busca cadastros com filtros combinados
 *     description: >
 *       Fluxo 2, Seção 3.2.4.2. Aceita múltiplos filtros simultâneos e opcionais.
 *       Retorna resultados ordenados por vulnerabilidade (RN09).
 *       Exclui automaticamente registros com deletedAt IS NOT NULL.
 *     tags: [Cadastros]
 *     parameters:
 *       - in: query
 *         name: bairro
 *         schema: { type: string }
 *         description: Filtro parcial por nome de bairro (case-insensitive)
 *       - in: query
 *         name: faixa_etaria
 *         schema:
 *           type: string
 *           enum: [crianca, adolescente, adulto, idoso]
 *         description: Faixa etária do responsável (calculada via data_nascimento)
 *       - in: query
 *         name: deficiencias
 *         schema:
 *           type: string
 *           enum: [Fisica, Auditiva, Visual, Intelectual, Psicossocial, Neurodivergência]
 *         description: Tipo de necessidade especial de qualquer membro da família
 *     responses:
 *       200:
 *         description: Lista de cadastros encontrados (vazia retorna mensagem amigável)
 *       500:
 *         description: Erro interno
 */
router.get("/cadastros/filtros", controller.buscarComFiltros);

/**
 * @swagger
 * /cadastros/{id}:
 *   get:
 *     summary: Carrega os dados agregados para a tela de edição
 *     description: Retorna os dados agregados de Pessoa, Moradia e Necessidades Especiais. Atende ao Fluxo 3, Seção 3.2.4.3. Implementa a RN21.
 *     tags: [Cadastros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cadastro (Pessoa)
 *     responses:
 *       200:
 *         description: Dados agregados do cadastro retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pessoa:
 *                   type: object
 *                 moradia:
 *                   type: object
 *                 necessidades:
 *                   type: object
 *       404:
 *         description: Cadastro não encontrado ou excluído (deletedAt IS NOT NULL)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: "Cadastro não encontrado ou já foi excluído."
 */
router.get("/cadastros/:id", controller.buscarPorId);

export default router;
