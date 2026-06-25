import { pool } from "../config/database";
import { PoolClient } from "pg";

export class PessoaRepository {
  async criar(dados: any) {
    const query = `
      INSERT INTO pessoa (
        nome,
        nome_social,
        telefone,
        cpf,
        data_nascimento,
        rg,
        uf,
        estado_civil,
        genero,
        genero_outro,
        cor_raca,
        escolaridade,
        profissao,
        situacao_ocupacional,
        nome_mae,
        nome_pai,
        local_nascimento,
        gestante,
        tempo_gestacao_semanas,
        tipo_responsavel,
        moradia_id,
        grau_parentesco,
        grau_parentesco_outro
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,$20,$21,
        $22,$23
      )
      RETURNING *
    `;

    const values = [
      dados.nome,
      dados.nome_social,
      dados.telefone || null,
      dados.cpf,
      dados.data_nascimento,
      dados.rg,
      dados.uf,
      dados.estado_civil,
      dados.genero,
      dados.genero !== 'Outro' ? null : (dados.genero_outro || null),
      dados.cor_raca,
      dados.escolaridade,
      dados.profissao,
      dados.situacao_ocupacional,
      dados.nome_mae,
      dados.nome_pai,
      dados.local_nascimento,
      dados.gestante,
      dados.gestante ? dados.tempo_gestacao_semanas : null,
      dados.tipo_responsavel,
      dados.moradia_id || null,
      dados.grau_parentesco || null,
      dados.grau_parentesco !== 'Outro' ? null : (dados.grau_parentesco_outro || null)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async atualizarMoradia(id: string, moradia_id: string, client?: PoolClient) {
    const db = client || pool;
    const query = `UPDATE pessoa SET moradia_id = $1 WHERE id = $2 RETURNING *`;
    const result = await db.query(query, [moradia_id, id]);
    return result.rows[0];
  }

  // Adicione este método que o Service precisa!
  async buscarPorId(id: string) {
    const query = `SELECT * FROM pessoa WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Adicione este método que o Service precisa!
  async buscarCpf(cpf: string) {
    const query = `SELECT * FROM pessoa WHERE cpf = $1`;
    const result = await pool.query(query, [cpf]);
    return result.rows[0];
  }

  private static readonly COLUNAS_PERMITIDAS = new Set([
    "nome", "nome_social", "telefone", "cpf", "data_nascimento", "rg", "uf",
    "estado_civil", "genero", "genero_outro", "cor_raca", "escolaridade", "profissao",
    "situacao_ocupacional", "nome_mae", "nome_pai", "local_nascimento",
    "gestante", "tempo_gestacao_semanas", "tipo_responsavel", "moradia_id",
    "grau_parentesco", "grau_parentesco_outro"
  ]);

  async atualizar(id: string, dados: any) {
    const keys = Object.keys(dados).filter(k => PessoaRepository.COLUNAS_PERMITIDAS.has(k));
    if (keys.length === 0) return this.buscarPorId(id);

    const updateQueryFields = keys.map((k, index) => `${k} = $${index + 2}`).join(", ");
    
    // RN17: Garante a atualização programática do dataAtualizacao/data_atualizacao
    const query = `
      UPDATE pessoa
      SET ${updateQueryFields}, data_atualizacao = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...keys.map(k => dados[k])];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}