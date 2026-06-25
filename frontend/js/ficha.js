import { salvarCadastro } from '../src/api.js';

// ── Multi-select customizado ───────────────────────────────────────────
class MultiSelect {
  constructor(selectEl, { onChange } = {}) {
    this._el = selectEl;
    this._selected = new Set();
    this._opts = Array.from(selectEl.options).filter(o => o.value !== '');
    this._onChange = onChange || null;
    this._build();
  }

  _build() {
    const wrap = document.createElement('div');
    wrap.className = 'ms';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'input ms__trigger';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');

    const disp = document.createElement('span');
    disp.className = 'ms__display';
    disp.textContent = 'Selecione';
    this._disp = disp;

    const arrow = document.createElement('i');
    arrow.className = 'ti ti-chevron-down ms__arrow';
    arrow.setAttribute('aria-hidden', 'true');

    btn.appendChild(disp);
    btn.appendChild(arrow);
    this._btn = btn;

    const drop = document.createElement('div');
    drop.className = 'ms__dropdown';
    drop.hidden = true;
    drop.setAttribute('role', 'listbox');
    drop.setAttribute('aria-multiselectable', 'true');
    this._drop = drop;

    drop.addEventListener('click', (e) => e.stopPropagation());

    this._opts.forEach(opt => {
      const val = opt.value || opt.text;
      const lbl = document.createElement('label');
      lbl.className = 'ms__option';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = val;
      cb.tabIndex = -1;

      const txt = document.createElement('span');
      txt.textContent = opt.text;

      lbl.appendChild(cb);
      lbl.appendChild(txt);
      drop.appendChild(lbl);

      lbl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        cb.checked = !cb.checked;
        if (cb.checked) this._selected.add(val);
        else this._selected.delete(val);
        this._updateDisp();
        this._el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._drop.hidden) this._open();
      else this._close();
    });

    document.addEventListener('click', () => this._close(), { passive: true });

    wrap.appendChild(btn);
    wrap.appendChild(drop);

    this._el.hidden = true;
    this._el.parentNode.insertBefore(wrap, this._el);
    this._wrap = wrap;
  }

  _open() {
    this._drop.hidden = false;
    this._btn.setAttribute('aria-expanded', 'true');
    this._btn.classList.add('ms__trigger--open');
  }

  _close() {
    if (this._drop.hidden) return;
    this._drop.hidden = true;
    this._btn.setAttribute('aria-expanded', 'false');
    this._btn.classList.remove('ms__trigger--open');
  }

  _updateDisp() {
    if (this._selected.size === 0) {
      this._disp.textContent = 'Selecione';
      this._disp.classList.remove('ms__display--selected');
    } else {
      this._disp.textContent = Array.from(this._selected).join(', ');
      this._disp.classList.add('ms__display--selected');
    }
    if (this._onChange) this._onChange(this);
  }

  getValue() {
    return Array.from(this._selected).join(', ');
  }

  reset() {
    this._selected.clear();
    this._drop.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb.checked = false));
    this._close();
    this._updateDisp();
  }
}

// onlyIds: quando fornecido, aplica MultiSelect apenas nos campos cujo id/name esteja na lista.
// Campos de seleção única permanecem como <select> nativo.
const MULTI_SELECT_IDS = ['sinais_alerta', 'riscos_moradia', 'tipo_necessidade', 'veiculo', 'meio_alertas'];

function initMultiSelects(container, callbacks = {}, onlyIds = MULTI_SELECT_IDS) {
  container.querySelectorAll('select.input').forEach(sel => {
    if (sel._multiSelect) return;
    const key = sel.id || sel.name;
    if (onlyIds && !onlyIds.includes(key)) return;
    sel._multiSelect = new MultiSelect(sel, { onChange: callbacks[key] || null });
  });
}

// ── Máscaras ───────────────────────────────────────────────────────────
const maskCPF = (v) =>
  v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);

const maskCEP = (v) =>
  v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

const maskTelefone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

// ── Validação CPF ──────────────────────────────────────────────────────
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +cpf[i] * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== +cpf[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +cpf[i] * (11 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === +cpf[10];
}

// ── Máscaras de input ─────────────────────────────────────────────────
function setupMasks() {
  const cpfEl   = document.getElementById('cpf');
  const cpfErro = document.getElementById('cpf-erro');
  const cepEl   = document.getElementById('cep');

  cpfEl.addEventListener('input', (e) => {
    e.target.value = maskCPF(e.target.value);
    cpfErro.textContent = '';
  });
  cpfEl.addEventListener('blur', (e) => {
    const v = e.target.value.trim();
    if (v && !validarCPF(v)) cpfErro.textContent = 'CPF inválido';
  });
  cepEl.addEventListener('input', (e) => {
    e.target.value = maskCEP(e.target.value);
  });

  const telEl   = document.getElementById('telefone');
  const telErro = document.getElementById('telefone-erro');

  telEl.addEventListener('input', (e) => {
    e.target.value = maskTelefone(e.target.value);
    telErro.textContent = '';
    e.target.removeAttribute('aria-invalid');
  });
  telEl.addEventListener('blur', (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits && (digits.length < 10 || digits.length > 11)) {
      telErro.textContent = 'Informe DDD + número (10 ou 11 dígitos)';
      e.target.setAttribute('aria-invalid', 'true');
    }
  });
}

// ── Validação de data de nascimento ────────────────────────────────────
function isLeapYear(y) {
  y = Number(y);
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

function daysInMonth(y, m) {
  y = Number(y);
  m = Number(m);
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [4,6,9,11].includes(m) ? 30 : 31;
}

function isValidDateParts(d, m, y) {
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) return false;
  const dd = Number(d);
  const mm = Number(m);
  const yy = Number(y);
  if (mm < 1 || mm > 12) return false;
  const dim = daysInMonth(yy, mm);
  if (dd < 1 || dd > dim) return false;
  return true;
}

function isValidIsoDateString(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [yy, mm, dd] = s.split('-').map(Number);
  return isValidDateParts(String(dd), String(mm), String(yy));
}

function todayISO() {
  const d  = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}


// ── GPS ────────────────────────────────────────────────────────────────
const GPS_BTN_LABEL = '<i class="ti ti-map-pin" aria-hidden="true"></i> Capturar GPS';

function setupGPS() {
  const btn    = document.getElementById('btn-gps');
  const latEl  = document.getElementById('latitude');
  const lonEl  = document.getElementById('longitude');
  const status = document.getElementById('gps-status');

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.className   = 'field__hint field__hint--error';
      status.textContent = 'Geolocalização não é suportada neste navegador ou dispositivo.';
      return;
    }

    btn.innerHTML  = '<i class="ti ti-loader-2" aria-hidden="true"></i> Obtendo localização…';
    btn.disabled   = true;
    status.className   = 'field__hint';
    status.textContent = 'Solicitando permissão e localização…';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latEl.value = pos.coords.latitude.toFixed(6);
        lonEl.value = pos.coords.longitude.toFixed(6);
        status.className   = 'field__hint field__hint--ok';
        status.textContent = `✓ Localização capturada (precisão: ±${Math.round(pos.coords.accuracy)} m)`;
        btn.innerHTML  = '<i class="ti ti-map-pin-check" aria-hidden="true"></i> Atualizar GPS';
        btn.disabled   = false;
        btn.style.background = 'var(--cor-marca-verde)';
      },
      (err) => {
        // Códigos: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        const msgs = {
          1: 'Permissão negada. Habilite a localização nas configurações do navegador e tente novamente.',
          2: 'Localização indisponível. Verifique se o GPS do dispositivo está ativo.',
          3: 'Tempo esgotado ao obter localização. Tente em local aberto ou com melhor sinal.',
        };
        status.className   = 'field__hint field__hint--error';
        status.textContent = msgs[err.code] || `Erro ao obter localização: ${err.message}`;
        btn.innerHTML  = GPS_BTN_LABEL;
        btn.disabled   = false;
        btn.style.background = '';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

// ── Preview de fotos ───────────────────────────────────────────────────
function setupPhotoPreview(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    preview.src    = URL.createObjectURL(file);
    preview.hidden = false;
    input.closest('.foto-area').querySelector('.foto-area__placeholder').style.display = 'none';
  });
}

// ── Cards de membros (inline no card do Responsável) ──────────────────
let _membroId = 0;

const _UF_OPTS = `<option value="">Selecione</option>
  <option>AC</option><option>AL</option><option>AP</option><option>AM</option>
  <option>BA</option><option>CE</option><option>DF</option><option>ES</option>
  <option>GO</option><option>MA</option><option>MT</option><option>MS</option>
  <option>MG</option><option>PA</option><option>PB</option><option>PR</option>
  <option>PE</option><option>PI</option><option>RJ</option><option>RN</option>
  <option>RS</option><option>RO</option><option>RR</option><option>SC</option>
  <option>SP</option><option>SE</option><option>TO</option>`;

function pessoaFieldsHTML(id) {
  return `
  <div class="form-grid">
    <div class="field field--full">
      <label class="label label--required">Nome Completo</label>
      <input class="input" type="text" name="m_nome_${id}" placeholder="Nome completo">
    </div>
    <div class="field field--full">
      <label class="label">Nome Social</label>
      <input class="input" type="text" name="m_nome_social_${id}">
    </div>
    <div class="field">
      <label class="label label--required" for="m_grau_parentesco_${id}">Grau de Parentesco</label>
      <select class="input" id="m_grau_parentesco_${id}" name="m_grau_parentesco_${id}">
        <option value="">Selecione</option>
        <option>Responsável</option>
        <option>Cônjuge/Companheiro(a)</option>
        <option>Filho(a)</option>
        <option>Enteado(a)</option>
        <option>Pai/Mãe</option>
        <option>Irmão(ã)</option>
        <option>Avô/Avó</option>
        <option>Neto(a)</option>
        <option>Tio(a)</option>
        <option>Sobrinho(a)</option>
        <option>Genro/Nora</option>
        <option>Sogro(a)</option>
        <option>Outro</option>
      </select>
    </div>
    <div class="field" id="m_grau_parentesco_outro_wrap_${id}" style="display:none;" aria-live="polite">
      <label class="label" for="m_grau_parentesco_outro_${id}">Especifique o parentesco</label>
      <input class="input" type="text" id="m_grau_parentesco_outro_${id}" name="m_grau_parentesco_outro_${id}"
             placeholder="Digite o parentesco" aria-required="true">
    </div>
    <div class="field">
      <label class="label">CPF</label>
      <input class="input" type="text" name="m_cpf_${id}" placeholder="000.000.000-00" maxlength="14" inputmode="numeric">
    </div>
    <div class="field">
      <label class="label" for="m_telefone_${id}">Telefone</label>
      <input class="input" type="tel" id="m_telefone_${id}" name="m_telefone_${id}"
             placeholder="(00) 00000-0000" maxlength="15" inputmode="numeric">
    </div>
    <div class="field">
      <label class="label" for="m_nasc_${id}">Data de Nascimento</label>
      <input class="input" type="date" id="m_nasc_${id}" name="m_nasc_${id}">
    </div>
    <div class="field">
      <label class="label">RG</label>
      <input class="input" type="text" name="m_rg_${id}" placeholder="00.000.000-X">
    </div>
    <div class="field">
      <label class="label">UF de Emissão</label>
      <select class="input" name="m_uf_${id}">${_UF_OPTS}</select>
    </div>
    <div class="field">
      <label class="label">Estado Civil</label>
      <select class="input" name="m_estado_civil_${id}">
        <option value="">Selecione</option>
        <option>Solteiro(a)</option><option>Casado(a)</option>
        <option>Divorciado(a)</option><option>Viúvo(a)</option>
        <option>União Estável</option><option>Separado(a)</option>
      </select>
    </div>
    <div class="field">
      <label class="label" for="m_genero_${id}">Gênero</label>
      <select class="input" id="m_genero_${id}" name="m_genero_${id}">
        <option value="">Selecione</option>
        <option>Masculino</option><option>Feminino</option>
        <option>Outro</option>
      </select>
    </div>
    <div class="field" id="m_genero_outro_wrap_${id}" style="display:none;" aria-live="polite">
      <label class="label" for="m_genero_outro_${id}">Especifique o gênero</label>
      <input class="input" type="text" id="m_genero_outro_${id}" name="m_genero_outro_${id}"
             placeholder="Digite o gênero" aria-required="true">
    </div>
    <div class="field">
      <label class="label">Cor / Raça</label>
      <select class="input" name="m_cor_raca_${id}">
        <option value="">Selecione</option>
        <option>Branca</option><option>Preta</option><option>Parda</option>
        <option>Amarela</option><option>Indígena</option><option>Prefiro não informar</option>
      </select>
    </div>
    <div class="field">
      <label class="label">Escolaridade</label>
      <select class="input" name="m_escolaridade_${id}">
        <option value="">Selecione</option>
        <option>Sem escolaridade</option>
        <option>Ensino Fundamental Incompleto</option>
        <option>Ensino Fundamental Completo</option>
        <option>Ensino Médio Incompleto</option>
        <option>Ensino Médio Completo</option>
        <option>Ensino Superior Incompleto</option>
        <option>Ensino Superior Completo</option>
        <option>Pós-graduação</option>
      </select>
    </div>
    <div class="field">
      <label class="label">Profissão</label>
      <input class="input" type="text" name="m_profissao_${id}">
    </div>
    <div class="field">
      <label class="label">Situação Ocupacional</label>
      <select class="input" name="m_situacao_${id}">
        <option value="">Selecione</option>
        <option>Empregado(a) com carteira</option>
        <option>Empregado(a) sem carteira</option>
        <option>Autônomo(a)</option><option>Desempregado(a)</option>
        <option>Aposentado(a) / Pensionista</option>
        <option>Estudante</option><option>Do lar</option><option>Não se aplica</option>
      </select>
    </div>
    <div class="field field--full">
      <label class="label">Nome da Mãe</label>
      <input class="input" type="text" name="m_nome_mae_${id}">
    </div>
    <div class="field field--full">
      <label class="label">Nome do Pai</label>
      <input class="input" type="text" name="m_nome_pai_${id}">
    </div>
    <div class="field">
      <label class="label">Local de Nascimento</label>
      <input class="input" type="text" name="m_local_nasc_${id}" placeholder="Cidade / UF">
    </div>
    <div class="field field--check">
      <label class="check-label">
        <input type="checkbox" name="m_gestante_${id}">
        <span>Gestante</span>
      </label>
    </div>
    <div class="field" id="m_tempo_gestacao_wrap_${id}" style="display:none;" aria-live="polite">
      <label class="label" for="m_tempo_gestacao_semanas_${id}">Tempo de gestação (semanas)</label>
      <input class="input" type="number" id="m_tempo_gestacao_semanas_${id}" name="m_tempo_gestacao_semanas_${id}"
             min="1" max="42" step="1" placeholder="Ex.: 20" aria-required="true">
    </div>
  </div>`;
}

function addMember() {
  const lista = document.getElementById('membros-lista');
  const id    = ++_membroId;
  const count = lista.querySelectorAll('.membro-card').length + 1;

  const div = document.createElement('div');
  div.className   = 'membro-card';
  div.dataset.mid = id;
  div.innerHTML   = `
    <div class="membro-card__header">
      <span class="membro-card__num">Pessoa ${count}</span>
      <button type="button" class="btn btn--danger btn-rm-membro" title="Remover">✕</button>
    </div>
    ${pessoaFieldsHTML(id)}
  `;
  lista.appendChild(div);

  // Listener nativo para gênero "Outro" do membro (single-select)
  const generoElMembro = div.querySelector(`#m_genero_${id}`);
  if (generoElMembro) {
    generoElMembro.addEventListener('change', () => {
      const wrap  = document.getElementById(`m_genero_outro_wrap_${id}`);
      const input = document.getElementById(`m_genero_outro_${id}`);
      if (!wrap || !input) return;
      const isOutro = generoElMembro.value === 'Outro';
      wrap.style.display = isOutro ? '' : 'none';
      input.required     = isOutro;
      if (!isOutro) input.value = '';
      else input.focus();
    });
  }

  // Listener nativo para grau de parentesco "Outro" do membro (single-select)
  const parentescoEl = div.querySelector(`#m_grau_parentesco_${id}`);
  if (parentescoEl) {
    parentescoEl.addEventListener('change', () => {
      const wrap  = document.getElementById(`m_grau_parentesco_outro_wrap_${id}`);
      const input = document.getElementById(`m_grau_parentesco_outro_${id}`);
      if (!wrap || !input) return;
      const isOutro = parentescoEl.value === 'Outro';
      wrap.style.display = isOutro ? '' : 'none';
      input.required     = isOutro;
      if (!isOutro) input.value = '';
      else input.focus();
    });
  }

  div.querySelector(`[name="m_cpf_${id}"]`).addEventListener('input', (e) => {
    e.target.value = maskCPF(e.target.value);
  });
  div.querySelector(`[name="m_telefone_${id}"]`).addEventListener('input', (e) => {
    e.target.value = maskTelefone(e.target.value);
  });
}

function setupMembros() {
  const lista = document.getElementById('membros-lista');
  lista.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-rm-membro');
    if (!btn) return;
    e.stopPropagation();
    const card = btn.closest('[data-mid]');
    if (card) card.remove();
  });
  lista.addEventListener('change', (e) => {
    if (e.target.matches('[name^="m_gestante_"]')) {
      toggleMembroTempoGestacao(e.target);
    }
  });
  document.getElementById('btn-add-membro').addEventListener('click', addMember);
}

let _animalId = 0;

function animalCardHTML(id, count) {
  return `
  <div class="animal-card" data-aid="${id}">
    <div class="animal-card__header">
      <span class="animal-card__num">Animal ${count}</span>
      <button type="button" class="btn btn--danger btn-rm-animal" title="Remover animal">✕</button>
    </div>
    <div class="form-grid">
      <div class="field">
        <label class="label">Espécie</label>
        <select class="input" name="a_especie_${id}">
          <option value="">Selecione</option>
          <option>Cachorro</option>
          <option>Gato</option>
          <option>Ave</option>
          <option>Coelho</option>
          <option>Porco</option>
          <option>Galinha</option>
          <option>Cavalo</option>
          <option>Outro</option>
        </select>
      </div>
      <div class="field" data-outro-field-id="outro-${id}" style="display:none;">
        <label class="label">Especifique</label>
        <input class="input" type="text" name="a_especie_outro_${id}" placeholder="Ex.: Coelha angorá">
      </div>
      <div class="field">
        <label class="label">Nome</label>
        <input class="input" type="text" name="a_nome_${id}" placeholder="Ex.: Bolinha">
      </div>
      <div class="field">
        <label class="label">Raça</label>
        <input class="input" type="text" name="a_raca_${id}" placeholder="Ex.: SRD, Vira-lata">
      </div>
      <div class="field">
        <label class="label">Porte</label>
        <select class="input" name="a_porte_${id}">
          <option value="">Selecione</option>
          <option>Pequeno</option>
          <option>Médio</option>
          <option>Grande</option>
          <option>Gigante</option>
        </select>
      </div>
      <div class="field">
        <label class="label">Idade aproximada</label>
        <select class="input" name="a_idade_${id}">
          <option value="">Selecione</option>
          <option>1-5 anos</option>
          <option>5-10 anos</option>
          <option>10-15 anos</option>
          <option>Não sei dizer</option>
        </select>
      </div>
      <div class="field field--check">
        <label class="check-label">
          <input type="checkbox" name="a_vacinacao_${id}">
          <span>Vacinação em dia</span>
        </label>
      </div>
      <div class="field field--check">
        <label class="check-label">
          <input type="checkbox" name="a_precisa_transporte_${id}">
          <span>Precisa de ajuda para ser transportado</span>
        </label>
      </div>
      <div class="field">
        <label class="label">Temperamento</label>
        <select class="input" name="a_temperamento_${id}">
          <option value="">Selecione</option>
          <option>Calmo</option>
          <option>Medroso</option>
          <option>Agressivo</option>
          <option>Brincalhão</option>
          <option>Independente</option>
        </select>
      </div>
      <div class="field field--full">
        <label class="label">Observações</label>
        <textarea class="input" name="a_observacoes_${id}" rows="2" placeholder="Informações extras"></textarea>
      </div>
      <div class="field field--full">
        <label class="label">Foto</label>
        <div class="foto-area">
          <input type="file" name="a_foto_${id}" accept="image/*" class="foto-area__input">
          <span class="foto-area__placeholder"><i class="ti ti-camera"></i> Toque para fotografar</span>
          <img id="preview_animal_${id}" class="foto-area__preview" alt="Pré-visualização animal" hidden>
        </div>
      </div>
    </div>
  </div>`;
}

function addAnimal() {
  const lista = document.getElementById('animais-lista');
  const id = ++_animalId;
  const count = lista.querySelectorAll('.animal-card').length + 1;
  const div = document.createElement('div');
  div.innerHTML = animalCardHTML(id, count);
  const card = div.firstElementChild;
  lista.appendChild(card);
}

function toggleAnimalPorte(card) {
  const aid = card.dataset.aid;
  const especie = card.querySelector(`[name="a_especie_${aid}"]`)?.value;
  const porteField = card.querySelector(`[data-porte-field-id="porte-${aid}"]`);
  if (!porteField) return;
  porteField.style.display = especie === 'Cachorro' || especie === 'Gato' ? '' : 'none';
}

function updateAnimalPreview(input) {
  const file = input.files[0];
  const card = input.closest('.animal-card');
  if (!card) return;
  const preview = card.querySelector('.foto-area__preview');
  const placeholder = card.querySelector('.foto-area__placeholder');
  if (!file) {
    if (preview) preview.hidden = true;
    if (placeholder) placeholder.style.display = '';
    return;
  }
  if (preview) {
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  }
  if (placeholder) placeholder.style.display = 'none';
}

function setupAnimais() {
  const lista = document.getElementById('animais-lista');
  lista.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-rm-animal');
    if (!btn) return;
    const card = btn.closest('.animal-card');
    if (card) card.remove();
  });
  lista.addEventListener('change', (e) => {
    const target = e.target;
    if (target.matches('[name^="a_especie_"]')) {
      const card = target.closest('.animal-card');
      if (card) toggleAnimalOutro(card);
    }
    if (target.matches('input[type="file"][name^="a_foto_"]')) {
      updateAnimalPreview(target);
    }
  });
  document.getElementById('btn-add-animal').addEventListener('click', addAnimal);
}

function toggleAnimalOutro(card) {
  const aid = card.dataset.aid;
  const especieEl = card.querySelector(`[name="a_especie_${aid}"]`);
  const especie = especieEl?._multiSelect?.getValue() || especieEl?.value || '';
  const outroField = card.querySelector(`[data-outro-field-id="outro-${aid}"]`);
  if (!outroField) return;
  outroField.style.display = especie.split(', ').some(e => e.trim() === 'Outro') ? '' : 'none';
}

// ── Callbacks de multi-select (apenas para os 5 campos que permanecem multi-select) ───
function sinaisAlertaCallback(ms) {
  const wrap  = document.getElementById('sinais-outro-wrap');
  const input = document.getElementById('sinais_alerta_outro');
  if (!wrap || !input) return;
  const isOutro = ms._selected.has('Outro');
  wrap.style.display = isOutro ? '' : 'none';
  if (!isOutro) {
    input.value = '';
  } else {
    input.focus();
  }
}

// ── Gênero "Outro" — listener nativo para single-select ───────────────
function setupGeneroOutro() {
  const sel   = document.getElementById('genero');
  const wrap  = document.getElementById('genero-outro-wrap');
  const input = document.getElementById('genero_outro');
  if (!sel || !wrap || !input) return;
  sel.addEventListener('change', () => {
    const isOutro = sel.value === 'Outro';
    wrap.style.display = isOutro ? '' : 'none';
    input.required     = isOutro;
    if (!isOutro) input.value = '';
    else input.focus();
  });
}

// ── Tempo de gestação — exibido quando "gestante" é marcado ────────────
function toggleTempoGestacao() {
  const checkbox = document.getElementById('gestante');
  const wrap     = document.getElementById('tempo-gestacao-wrap');
  const input    = document.getElementById('tempo_gestacao_semanas');
  if (!wrap || !input) return;
  const isGestante = checkbox.checked;
  wrap.style.display = isGestante ? '' : 'none';
  input.required      = isGestante;
  if (!isGestante) {
    input.value = '';
  } else {
    input.focus();
  }
}

function setupGestante() {
  document.getElementById('gestante').addEventListener('change', toggleTempoGestacao);
}

function toggleMembroTempoGestacao(checkbox) {
  const mid   = checkbox.name.replace(/^m_gestante_/, '');
  const wrap  = document.getElementById(`m_tempo_gestacao_wrap_${mid}`);
  const input = document.getElementById(`m_tempo_gestacao_semanas_${mid}`);
  if (!wrap || !input) return;
  const isGestante = checkbox.checked;
  wrap.style.display = isGestante ? '' : 'none';
  input.required      = isGestante;
  if (!isGestante) {
    input.value = '';
  } else {
    input.focus();
  }
}

// ── Coleta de dados ────────────────────────────────────────────────────
function collectFormData() {
  const v = (id) => {
    const el = document.getElementById(id);
    if (el?._multiSelect) return el._multiSelect.getValue();
    return el?.value?.trim() || '';
  };
  const b = (id) => !!document.getElementById(id)?.checked;

  const animais = [];
  document.querySelectorAll('#animais-lista .animal-card').forEach((card) => {
    const aid = card.dataset.aid;
    const q = (n) => {
      const el = card.querySelector(`[name="${n}"]`);
      if (el?._multiSelect) return el._multiSelect.getValue();
      return el?.value?.trim() || '';
    };
    const especieRaw = q(`a_especie_${aid}`);
    if (!especieRaw) return;
    const especieOutro = q(`a_especie_outro_${aid}`);
    const especie = especieRaw.split(', ')
      .map(e => e.trim() === 'Outro' && especieOutro ? especieOutro : e.trim())
      .filter(Boolean)
      .join(', ');
    animais.push({
      especie,
      nome: q(`a_nome_${aid}`),
      raca: q(`a_raca_${aid}`),
      porte: q(`a_porte_${aid}`),
      idade_aproximada: q(`a_idade_${aid}`),
      vacinacao_em_dia: !!card.querySelector(`[name="a_vacinacao_${aid}"]`)?.checked,
      precisa_transporte: !!card.querySelector(`[name="a_precisa_transporte_${aid}"]`)?.checked,
      temperamento: q(`a_temperamento_${aid}`),
      observacoes: q(`a_observacoes_${aid}`),
      foto: card.querySelector(`[name="a_foto_${aid}"]`)?.files?.[0] || null,
    });
  });

  const membros = [];
  document.querySelectorAll('#membros-lista .membro-card').forEach((card) => {
    const mid  = card.dataset.mid;
    const nome = card.querySelector(`[name="m_nome_${mid}"]`)?.value?.trim();
    if (!nome) return;
    const q = (n) => {
      const el = card.querySelector(`[name="${n}"]`);
      if (el?._multiSelect) return el._multiSelect.getValue();
      return el?.value?.trim() || '';
    };
    // CPF: preserva valor bruto; api.js filtra para exatamente 11 dígitos
    const cpfRaw = q(`m_cpf_${mid}`);
    const nasc = q(`m_nasc_${mid}`);
    membros.push({
      nome,
      nome_social:          q(`m_nome_social_${mid}`),
      grau_parentesco:      q(`m_grau_parentesco_${mid}`),
      grau_parentesco_outro: q(`m_grau_parentesco_outro_${mid}`),
      cpf:                  cpfRaw,
      data_nascimento:      nasc,
      rg:                   q(`m_rg_${mid}`),
      uf:                   q(`m_uf_${mid}`),
      estado_civil:         q(`m_estado_civil_${mid}`),
      genero:               q(`m_genero_${mid}`),
      genero_outro:         q(`m_genero_outro_${mid}`),
      cor_raca:             q(`m_cor_raca_${mid}`),
      escolaridade:         q(`m_escolaridade_${mid}`),
      profissao:            q(`m_profissao_${mid}`),
      situacao_ocupacional: q(`m_situacao_${mid}`),
      nome_mae:             q(`m_nome_mae_${mid}`),
      nome_pai:             q(`m_nome_pai_${mid}`),
      local_nascimento:     q(`m_local_nasc_${mid}`),
      gestante:             !!card.querySelector(`[name="m_gestante_${mid}"]`)?.checked,
      tempo_gestacao_semanas: (() => {
        const isGestante = !!card.querySelector(`[name="m_gestante_${mid}"]`)?.checked;
        if (!isGestante) return null;
        const n = parseInt(q(`m_tempo_gestacao_semanas_${mid}`), 10);
        return Number.isInteger(n) ? n : null;
      })(),
      telefone:             q(`m_telefone_${mid}`).replace(/\D/g, ''),
    });
  });

  return {
    numero_ficha:         v('numero_ficha'),
    // Responsável
    nome:                 v('nome'),
    nome_social:          v('nome_social'),
    cpf:                  v('cpf'),
    telefone:             v('telefone').replace(/\D/g, ''),
    data_nascimento:      v('data_nascimento'),
    rg:                   v('rg'),
    uf:                   v('uf'),
    estado_civil:         v('estado_civil'),
    genero:               v('genero'),
    genero_outro:         v('genero_outro'),
    cor_raca:             v('cor_raca'),
    escolaridade:         v('escolaridade'),
    profissao:            v('profissao'),
    situacao_ocupacional: v('situacao_ocupacional'),
    nome_mae:             v('nome_mae'),
    nome_pai:             v('nome_pai'),
    local_nascimento:     v('local_nascimento'),
    gestante:             b('gestante'),
    tempo_gestacao_semanas: (() => {
      if (!b('gestante')) return null;
      const n = parseInt(v('tempo_gestacao_semanas'), 10);
      return Number.isInteger(n) ? n : null;
    })(),
    tipo_responsavel:     'Responsavel',
    // Moradia
    cep:                  v('cep'),
    endereco:             v('endereco'),
    numero:               v('numero'),
    complemento:          v('complemento'),
    bairro:               v('bairro'),
    cidade:               v('cidade'),
    tipo_construcao:      v('tipo_construcao'),
    tempo_residencia:     v('tempo_residencia'),
    uso_imovel:           v('uso_imovel'),
    condicao:             v('condicao'),
    numero_pavimentos:    v('numero_pavimentos'),
    historico:            v('historico'),
    grau_de_risco:        document.querySelector('[name="grau_de_risco"]:checked')?.value || '',
    riscos_moradia:       v('riscos_moradia'),
    sinais_alerta:        (() => {
      const base  = v('sinais_alerta');
      const outro = v('sinais_alerta_outro');
      if (!base) return '';
      return base.split(', ')
        .map(s => s.trim() === 'Outro' && outro ? outro : s.trim())
        .filter(Boolean)
        .join(', ');
    })(),
    latitude:             v('latitude')  ? parseFloat(v('latitude'))  : null,
    longitude:            v('longitude') ? parseFloat(v('longitude')) : null,
    // Vulnerabilidades
    idosos:                b('idosos'),
    criancas:              b('criancas'),
    gestantes_lactantes:   b('gestantes_lactantes'),
    mobilidade_reduzida:   b('mobilidade_reduzida'),
    doencas_cronicas:      b('doencas_cronicas'),
    medicamentos_continuos:b('medicamentos_continuos'),
    tipo_necessidade:      v('tipo_necessidade') || 'Nenhuma',
    // Informações sociais
    vinculo_programas:     v('vinculo_programas'),
    veiculo:               v('veiculo'),
    animais:               undefined,
    animais_detalhados:    animais,
    meio_alertas:          v('meio_alertas'),
    destino_evacuacao:     v('destino_evacuacao'),
    contato_emergencia:    v('contato_emergencia'),
    // Família e fotos
    membros,
    fotos: {
      fachada: document.getElementById('foto_fachada').files[0] || null,
      entorno: document.getElementById('foto_entorno').files[0] || null,
    },
  };
}

// ── Toast ──────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast--visible${type ? ` toast--${type}` : ''}`;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('toast--visible'), 4500);
}

// ── Envio do formulário ────────────────────────────────────────────────
function setupForm() {
  const form      = document.getElementById('fichaForm');
  const submitBtn = document.getElementById('btn-submit');
  const cpfErro   = document.getElementById('cpf-erro');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome     = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const cpfVal   = document.getElementById('cpf').value.trim();

    if (!nome) {
      showToast('Nome do responsável é obrigatório.', 'error');
      document.getElementById('nome').focus();
      return;
    }
    if (!endereco) {
      showToast('Endereço é obrigatório.', 'error');
      document.getElementById('endereco').focus();
      return;
    }
    if (cpfVal && !validarCPF(cpfVal)) {
      cpfErro.textContent = 'CPF inválido';
      showToast('CPF inválido. Verifique os dígitos.', 'error');
      document.getElementById('cpf').focus();
      return;
    }

    const telEl2    = document.getElementById('telefone');
    const telErro2  = document.getElementById('telefone-erro');
    const telDigits = telEl2.value.replace(/\D/g, '');
    if (!telDigits) {
      telErro2.textContent = 'Telefone obrigatório';
      telEl2.setAttribute('aria-invalid', 'true');
      showToast('Telefone é obrigatório.', 'error');
      telEl2.focus();
      return;
    }
    if (telDigits.length < 10 || telDigits.length > 11) {
      telErro2.textContent = 'Informe DDD + número (10 ou 11 dígitos)';
      telEl2.setAttribute('aria-invalid', 'true');
      showToast('Telefone inválido. Informe DDD + número.', 'error');
      telEl2.focus();
      return;
    }
    telEl2.removeAttribute('aria-invalid');
    telErro2.textContent = '';

    // validar tempo de gestação do responsável
    if (document.getElementById('gestante').checked) {
      const tempoEl  = document.getElementById('tempo_gestacao_semanas');
      const tempoVal = parseInt(tempoEl.value, 10);
      if (!tempoEl.value.trim() || !Number.isInteger(tempoVal) || tempoVal < 1 || tempoVal > 42) {
        showToast('Tempo de gestação deve ser um número inteiro entre 1 e 42 semanas.', 'error');
        tempoEl.focus();
        return;
      }
    }

    // validar data de nascimento do responsável
    const dataNascResp = document.getElementById('data_nascimento').value.trim();
    if (dataNascResp) {
      if (!isValidIsoDateString(dataNascResp)) {
        showToast('Data de nascimento do responsável inválida.', 'error');
        document.getElementById('data_nascimento').focus();
        return;
      }
      if (dataNascResp > todayISO()) {
        showToast('Data de nascimento do responsável não pode ser no futuro.', 'error');
        document.getElementById('data_nascimento').focus();
        return;
      }
    }

    // validar datas de nascimento dos membros
    const invalidMember = Array.from(document.querySelectorAll('#membros-lista .membro-card')).find((card) => {
      const mid  = card.dataset.mid;
      const nasc = (card.querySelector(`[name="m_nasc_${mid}"]`)?.value || '').trim();
      if (!nasc) return false;
      return !isValidIsoDateString(nasc) || nasc > todayISO();
    });
    if (invalidMember) {
      showToast('Data de nascimento inválida em um dos membros (verifique se não é uma data futura).', 'error');
      invalidMember.querySelector(`[name^="m_nasc_"]`)?.focus();
      return;
    }

    // validar tempo de gestação dos membros
    const invalidMemberGestacao = Array.from(document.querySelectorAll('#membros-lista .membro-card')).find((card) => {
      const mid = card.dataset.mid;
      if (!card.querySelector(`[name="m_gestante_${mid}"]`)?.checked) return false;
      const input = card.querySelector(`[name="m_tempo_gestacao_semanas_${mid}"]`);
      const n = parseInt(input?.value, 10);
      return !input?.value?.trim() || !Number.isInteger(n) || n < 1 || n > 42;
    });
    if (invalidMemberGestacao) {
      showToast('Tempo de gestação inválido em um dos membros (1 a 42 semanas).', 'error');
      invalidMemberGestacao.querySelector('[name^="m_tempo_gestacao_semanas_"]')?.focus();
      return;
    }

    // validar grau de parentesco dos membros (apenas cartões com nome preenchido)
    const invalidMemberParentesco = Array.from(document.querySelectorAll('#membros-lista .membro-card')).find((card) => {
      const mid  = card.dataset.mid;
      const nome = card.querySelector(`[name="m_nome_${mid}"]`)?.value?.trim();
      if (!nome) return false;
      const grauEl = card.querySelector(`[name="m_grau_parentesco_${mid}"]`);
      const grau   = grauEl?._multiSelect?.getValue() || grauEl?.value || '';
      if (!grau) return true;
      if (grau === 'Outro') {
        const outro = card.querySelector(`[name="m_grau_parentesco_outro_${mid}"]`)?.value?.trim();
        if (!outro) return true;
      }
      return false;
    });
    if (invalidMemberParentesco) {
      showToast('Selecione o grau de parentesco de todos os membros (e especifique quando "Outro").', 'error');
      invalidMemberParentesco.querySelector('[name^="m_grau_parentesco_"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.classList.add('btn--loading');
    submitBtn.textContent = '';

    try {
      const result = await salvarCadastro(collectFormData());

      if (result.membroErrors?.length) {
        const nomes = result.membroErrors.map((e) => e.nome).join(', ');
        const motivos = result.membroErrors.map((e) => `${e.nome}: ${e.erro}`).join(' | ');
        console.error('[membros não salvos]', motivos);
        showToast(`Responsável salvo. Membros com erro: ${nomes}. Veja o console para detalhes.`, 'error');
      } else {
        showToast('Cadastro salvo com sucesso!', 'success');
      }

      form.reset();
      // form.reset() desmarca os checkboxes, mas não atualiza o texto dos multi-selects
      form.querySelectorAll('select.input').forEach(sel => sel._multiSelect?.reset());
      document.getElementById('membros-lista').innerHTML = '';
      document.getElementById('animais-lista').innerHTML = '';
      document.getElementById('preview_fachada').hidden = true;
      document.getElementById('preview_entorno').hidden = true;
      document.querySelectorAll('.foto-area__placeholder').forEach((p) => (p.style.display = ''));
      const gpsBtn = document.getElementById('btn-gps');
      gpsBtn.innerHTML       = GPS_BTN_LABEL;
      gpsBtn.style.background = '';
      gpsBtn.disabled         = false;
      document.getElementById('latitude').value  = '';
      document.getElementById('longitude').value = '';
      document.getElementById('gps-status').className   = 'field__hint';
      document.getElementById('gps-status').textContent = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      submitBtn.classList.remove('btn--loading');
      submitBtn.textContent = 'Salvar Cadastro';
    }
  });
}

// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupMasks();
  setupGPS();
  setupPhotoPreview('foto_fachada', 'preview_fachada');
  setupPhotoPreview('foto_entorno', 'preview_entorno');
  setupMembros();
  setupAnimais();
  setupGestante();
  setupForm();
  // Aplica MultiSelect apenas nos 5 campos que permitem múltipla seleção.
  // Todos os demais <select> permanecem como elemento nativo (única seleção).
  initMultiSelects(document.getElementById('fichaForm'), {
    sinais_alerta: sinaisAlertaCallback,
  });
  // Listener nativo para gênero "Outro" do responsável (single-select)
  setupGeneroOutro();
});
