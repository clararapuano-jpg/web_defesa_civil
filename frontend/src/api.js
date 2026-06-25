import { supabase } from './supabaseClient.js';

// Em produção o Express serve o front e a API na mesma origem, então o
// caminho relativo ('') já funciona. Só usamos a URL absoluta quando o
// front está sendo aberto pelo Live Server (porta 5500) em dev local,
// caso em que a API roda separada em outra porta (3000).
const isLiveServerDev = window.location.hostname === 'localhost' && window.location.port === '5500';
const API_BASE = isLiveServerDev ? 'http://localhost:3000' : '';

const RETRY_MAX_TENTATIVAS = 3;
const RETRY_DELAY_MS = 1500;

/**
 * fetch com retry automático para falhas de REDE (ex.: backend reiniciando
 * via ts-node-dev, que fecha a porta por ~1-2s a cada salvamento). Respostas
 * HTTP reais (4xx/5xx) não passam por aqui como erro — fetch só lança
 * exceção quando a conexão falha antes de qualquer resposta chegar.
 */
async function fetchComRetry(url, options, tentativa = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    console.error(`[fetchComRetry] falha de rede (tentativa ${tentativa}/${RETRY_MAX_TENTATIVAS}) em ${url}:`, err);
    if (tentativa >= RETRY_MAX_TENTATIVAS) {
      throw new Error('Não foi possível conectar ao servidor. Ele pode estar reiniciando — aguarde alguns segundos e tente novamente.');
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fetchComRetry(url, options, tentativa + 1);
  }
}

async function postJSON(endpoint, body) {
  const res = await fetchComRetry(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ erro: res.statusText }));
  if (!res.ok) throw new Error(json.erro || json.message || `HTTP ${res.status}`);
  return json;
}

async function postMultipart(endpoint, formData) {
  const res = await fetchComRetry(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({ erro: res.statusText }));
  if (!res.ok) throw new Error(json.erro || json.message || `HTTP ${res.status}`);
  return json;
}

/**
 * Salva um cadastro completo via backend Express.
 * Etapas 1-2 são críticas (lançam exceção).
 * Etapas 3-6 são tolerantes a falha (console.warn).
 */
export async function salvarCadastro(data) {
  // 1. Responsável — crítico
  const responsavel = await postJSON('/pessoas', {
    nome:                data.nome,
    nome_social:         data.nome_social         || undefined,
    cpf:                 data.cpf ? data.cpf.replace(/\D/g, '') : undefined,
    data_nascimento:     data.data_nascimento      || undefined,
    rg:                  data.rg                  || undefined,
    uf:                  data.uf                  || undefined,
    estado_civil:        data.estado_civil         || undefined,
    genero:              data.genero              || undefined,
    cor_raca:            data.cor_raca            || undefined,
    escolaridade:        data.escolaridade         || undefined,
    profissao:           data.profissao            || undefined,
    situacao_ocupacional:data.situacao_ocupacional || undefined,
    nome_mae:            data.nome_mae             || undefined,
    nome_pai:            data.nome_pai             || undefined,
    local_nascimento:    data.local_nascimento     || undefined,
    gestante:            data.gestante             || false,
    tipo_responsavel:    data.tipo_responsavel || 'Responsavel',
  });

  const responsavelId = responsavel.id;

  // 2. Moradia — crítico
  const moradia = await postJSON('/moradias', {
    pessoa_id:        responsavelId,
    endereco:         data.endereco,
    numero:           data.numero           || undefined,
    bairro:           data.bairro           || undefined,
    cidade:           data.cidade           || undefined,
    cep:              data.cep ? data.cep.replace(/\D/g, '') : undefined,
    complemento:      data.complemento      || undefined,
    tipo_construcao:  data.tipo_construcao  || undefined,
    tempo_residencia: data.tempo_residencia || undefined,
    historico:        data.historico        || undefined,
    uso_imovel:       data.uso_imovel       || undefined,
    condicao:         data.condicao         || undefined,
    numero_pavimentos:data.numero_pavimentos|| undefined,
    sinais_alerta:    data.sinais_alerta    || undefined,
    grau_de_risco:    data.grau_de_risco    || undefined,
    riscos_moradia:   data.riscos_moradia   || undefined,
    numero_ficha:     data.numero_ficha     || undefined,
    latitude:         data.latitude  ?? undefined,
    longitude:        data.longitude ?? undefined,
  });

  const moradiaId = moradia.id;

  // 3. Necessidades — não crítico
  try {
    await postJSON('/necessidades', {
      pessoa_id:             responsavelId,
      idosos:                data.idosos,
      criancas:              data.criancas,
      gestantes_lactantes:   data.gestantes_lactantes,
      mobilidade_reduzida:   data.mobilidade_reduzida,
      doencas_cronicas:      data.doencas_cronicas,
      medicamentos_continuos:data.medicamentos_continuos,
      tipo_necessidade:      data.tipo_necessidade || 'Nenhuma',
    });
  } catch (e) { console.warn('[necessidades]', e.message); }

  // 4. Informações sociais — não crítico
  try {
    await postJSON('/informacoes-sociais', {
      pessoa_id:          responsavelId,
      vinculo_programas:  data.vinculo_programas  || undefined,
      veiculo:            data.veiculo            || undefined,
      animais:            undefined,
      meio_alertas:       data.meio_alertas       || undefined,
      destino_evacuacao:  data.destino_evacuacao  || undefined,
      contato_emergencia: data.contato_emergencia || undefined,
    });
  } catch (e) { console.warn('[informacoes-sociais]', e.message); }

  // 5. Animais / Pets — não crítico, mas preferível salvar quando possível
  const animalErrors = [];
  for (const animal of (data.animais_detalhados || [])) {
    try {
      const created = await postJSON(`/moradias/${moradiaId}/animais`, {
        especie: animal.especie,
        nome: animal.nome || undefined,
        raca: animal.raca || undefined,
        porte: animal.porte || undefined,
        idade_aproximada: animal.idade_aproximada || undefined,
        vacinacao_em_dia: animal.vacinacao_em_dia || undefined,
        temperamento: animal.temperamento || undefined,
        observacoes: animal.observacoes || undefined,
      });

      if (animal.foto) {
        const fd = new FormData();
        fd.append('arquivo', animal.foto);
        await postMultipart(`/animais/${created.id}/imagem`, fd);
      }
    } catch (e) {
      console.warn('[animal]', animal.nome || animal.especie, e.message);
      animalErrors.push({ nome: animal.nome || animal.especie, erro: e.message });
    }
  }

  // 5. Membros familiares — apenas quando o cadastrado é Responsavel
  const membroErrors = [];
  if (data.tipo_responsavel !== 'Membro') {
    for (const m of (data.membros || [])) {
      // CPF: só envia se tiver exatamente 11 dígitos; CPF parcial causaria erro Zod
      const cpfDigits = (m.cpf || '').replace(/\D/g, '');
      try {
        await postJSON(`/pessoas/${responsavelId}/membros`, {
          nome:                 m.nome,
          nome_social:          m.nome_social          || undefined,
          grau_parentesco:      m.grau_parentesco      || undefined,
          grau_parentesco_outro:m.grau_parentesco_outro || undefined,
          cpf:                  cpfDigits.length === 11 ? cpfDigits : undefined,
          data_nascimento:      m.data_nascimento       || undefined,
          rg:                   m.rg                   || undefined,
          uf:                   m.uf                   || undefined,
          estado_civil:         m.estado_civil          || undefined,
          genero:               m.genero               || undefined,
          cor_raca:             m.cor_raca             || undefined,
          escolaridade:         m.escolaridade          || undefined,
          profissao:            m.profissao             || undefined,
          situacao_ocupacional: m.situacao_ocupacional  || undefined,
          nome_mae:             m.nome_mae              || undefined,
          nome_pai:             m.nome_pai              || undefined,
          local_nascimento:     m.local_nascimento      || undefined,
          gestante:             m.gestante              || false,
          tipo_responsavel:     'Membro',
        });
      } catch (e) {
        console.error(`[membro ${m.nome}]`, e.message);
        membroErrors.push({ nome: m.nome, erro: e.message });
      }
    }
  }

  // 6. Fotos — não crítico
  for (const [tipo, file] of Object.entries(data.fotos || {})) {
    if (!file) continue;
    try {
      const fd = new FormData();
      fd.append('arquivo', file);
      await postMultipart(`/imagens/${moradiaId}`, fd);
    } catch (e) { console.warn(`[foto ${tipo}]`, e.message); }
  }

  return { responsavelId, moradiaId, membroErrors, animalErrors };
}

/** Lê cadastros diretamente do Supabase (leitura pública com anon key). */
export async function listarCadastros() {
  // Nota: buscamos também relacionamentos de moradia, necessidades e
  // informações sociais para permitir filtros de painel alinhados à ficha.
  const { data, error } = await supabase
    .from('pessoa')
    .select(`
      id,
      nome,
      cpf,
      data_nascimento,
      estado_civil,
      genero,
      moradia (
        id,
        endereco,
        numero,
        bairro,
        cidade,
        tipo_construcao,
        uso_imovel,
        condicao,
        numero_pavimentos,
        sinais_alerta,
        grau_de_risco,
        riscos_moradia
      ),
      necessidade (
        idosos,
        criancas,
        gestantes_lactantes,
        mobilidade_reduzida,
        doencas_cronicas,
        medicamentos_continuos,
        tipo_necessidade
      ),
      informacoes_sociais (
        meio_alertas,
        vinculo_programas
      )
    `)
    .eq('tipo_responsavel', 'Responsavel');

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Busca cadastros aplicando filtros combinados no backend
 * (GET /cadastros/filtros — bairro, faixa_etaria, deficiencias).
 * Retorna a lista de linhas (cada uma com responsavel_id/responsavel_nome +
 * dados da moradia). Lista vazia quando nada casa com os filtros.
 */
export async function buscarCadastrosFiltrados({ bairro, faixa_etaria, deficiencias } = {}) {
  const qs = new URLSearchParams();
  if (bairro)       qs.set('bairro', bairro);
  if (faixa_etaria) qs.set('faixa_etaria', faixa_etaria);
  if (deficiencias) qs.set('deficiencias', deficiencias);

  const res = await fetchComRetry(`${API_BASE}/cadastros/filtros?${qs.toString()}`);
  const json = await res.json().catch(() => ({ erro: res.statusText }));
  if (!res.ok) throw new Error(json.erro || json.message || `HTTP ${res.status}`);
  // O controller responde { dados: [...] } ou { mensagem } quando vazio.
  return Array.isArray(json) ? json : (json.dados ?? []);
}

export async function buscarCadastro(pessoaId) {
  const { data, error } = await supabase
    .from('pessoa')
    .select('*, moradia (*), necessidade (*), informacoes_sociais (*)')
    .eq('id', pessoaId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
