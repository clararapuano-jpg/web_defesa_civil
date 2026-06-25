import { pool } from "../config/database";

interface FiltrosCadastro {
  bairro?: string;
  faixa_etaria?: "crianca" | "adolescente" | "adulto" | "idoso";
  deficiencias?: string;
}

export class CadastroRepository {
  async buscarComFiltros(filtros: FiltrosCadastro) {
    const conditions: string[] = [`m."deletedAt" IS NULL`];
    const values: any[] = [];
    let idx = 1;

    if (filtros.bairro) {
      conditions.push(`m.bairro ILIKE $${idx}`);
      values.push(`%${filtros.bairro}%`);
      idx++;
    }

    if (filtros.faixa_etaria) {
      const faixas: Record<string, string> = {
        crianca:     `EXTRACT(YEAR FROM AGE(p.data_nascimento::DATE)) BETWEEN 0 AND 11`,
        adolescente: `EXTRACT(YEAR FROM AGE(p.data_nascimento::DATE)) BETWEEN 12 AND 17`,
        adulto:      `EXTRACT(YEAR FROM AGE(p.data_nascimento::DATE)) BETWEEN 18 AND 59`,
        idoso:       `EXTRACT(YEAR FROM AGE(p.data_nascimento::DATE)) >= 60`
      };
      const condicao = faixas[filtros.faixa_etaria];
      if (condicao) conditions.push(condicao);
    }

    if (filtros.deficiencias) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM pessoa p_def
          JOIN necessidade n_def ON n_def.pessoa_id = p_def.id
          WHERE p_def.moradia_id = m.id
            AND n_def.tipo_necessidade = $${idx}
        )
      `);
      values.push(filtros.deficiencias);
      idx++;
    }

    const where = conditions.join(" AND ");

    // RN09: famílias com qualquer perfil de vulnerabilidade têm prioridade 0 (topo)
    const query = `
      SELECT
        m.id              AS moradia_id,
        m.bairro,
        m.endereco,
        m.numero,
        m.cidade,
        m.cep,
        m.latitude,
        m.longitude,
        p.id              AS responsavel_id,
        p.nome            AS responsavel_nome,
        p.cpf             AS responsavel_cpf,
        p.data_nascimento,
        (
          SELECT json_agg(a.*) FROM animal a WHERE a.moradia_id = m.id
        ) AS animais,
        CASE WHEN EXISTS (
          SELECT 1 FROM pessoa p2
          JOIN necessidade n ON n.pessoa_id = p2.id
          WHERE p2.moradia_id = m.id
            AND (
              n.idosos = true OR n.criancas = true OR
              n.gestantes_lactantes = true OR n.mobilidade_reduzida = true OR
              n.doencas_cronicas = true OR n.medicamentos_continuos = true OR
              (n.tipo_necessidade IS NOT NULL AND n.tipo_necessidade <> 'Nenhuma')
            )
        ) THEN 0 ELSE 1 END AS prioridade
      FROM moradia m
      JOIN pessoa p ON p.moradia_id = m.id AND p.tipo_responsavel = 'Responsavel'
      WHERE ${where}
      ORDER BY prioridade ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async buscarPorId(id: string) {
    const queryPessoa = `SELECT * FROM pessoa WHERE id = $1`;
    const resultPessoa = await pool.query(queryPessoa, [id]);
    const pessoa = resultPessoa.rows[0];

    if (!pessoa) return null;

    const queryMoradia = `SELECT * FROM moradia WHERE id = (SELECT moradia_id FROM pessoa WHERE id = $1)`;
    const queryNecessidade = `SELECT * FROM necessidade WHERE pessoa_id = $1`;

    const [resultMoradia, resultNecessidade] = await Promise.all([
      pool.query(queryMoradia, [id]),
      pool.query(queryNecessidade, [id])
    ]);

    return {
      pessoa,
      moradia: resultMoradia.rows[0] || null,
      necessidades: resultNecessidade.rows
    };
  }
}
