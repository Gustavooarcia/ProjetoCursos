const telaAuth = document.querySelector('#tela-auth');
const painel = document.querySelector('#painel');
const mensagemGlobal = document.querySelector('#mensagem-global');
const statusConexao = document.querySelector('#status-conexao');
const formAuth = document.querySelector('#form-auth');
const listaCursos = document.querySelector('#lista-cursos');
const tabelaMatriculas = document.querySelector('#tabela-matriculas');
const tabelaUsuarios = document.querySelector('#tabela-usuarios');

let modoAuth = 'login';
let sessaoAtual = null;
let perfilAtual = null;
let cursosAtuais = [];
let perfisVisiveis = [];
let timerMensagem;
let usuarioCarregado = null;
let cursosFiltrados = [];

function escapar(valor = '') {
  return String(valor).replace(/[&<>\'"]/g, caractere => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[caractere]);
}

function avisar(texto, tipo = 'sucesso') {
  mensagemGlobal.textContent = texto;
  mensagemGlobal.className = `mensagem ${tipo}`;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => { mensagemGlobal.textContent = ''; }, 6500);
}

function definirStatus(texto, ok = false) {
  statusConexao.querySelector('span').textContent = texto;
  statusConexao.className = `connection-pill${ok ? ' online' : ''}`;
}

function papelLegivel(papel) {
  return ({ administrador: 'Administrador', professor: 'Professor', aluno: 'Aluno' })[papel] || papel || 'Sem perfil';
}

function mudarModoAuth(modo) {
  modoAuth = modo;
  const cadastro = modo === 'cadastro';
  document.querySelector('#aba-login').classList.toggle('ativa', !cadastro);
  document.querySelector('#aba-cadastro').classList.toggle('ativa', cadastro);
  document.querySelector('#aba-login').setAttribute('aria-selected', String(!cadastro));
  document.querySelector('#aba-cadastro').setAttribute('aria-selected', String(cadastro));
  document.querySelector('#campo-nome-wrap').classList.toggle('oculto', !cadastro);
  document.querySelector('#auth-nome').required = cadastro;
  document.querySelector('#auth-senha').autocomplete = cadastro ? 'new-password' : 'current-password';
  document.querySelector('#titulo-auth').textContent = cadastro ? 'Comece sua trilha' : 'Boas-vindas de volta';
  document.querySelector('#ajuda-auth').textContent = cadastro
    ? 'Crie seu acesso para acompanhar cursos e matrículas.'
    : 'Entre com seus dados para continuar.';
  document.querySelector('#btn-auth-submit').innerHTML = cadastro
    ? 'Criar minha conta <span aria-hidden="true">→</span>'
    : 'Entrar na plataforma <span aria-hidden="true">→</span>';
}

document.querySelector('#aba-login').addEventListener('click', () => mudarModoAuth('login'));
document.querySelector('#aba-cadastro').addEventListener('click', () => mudarModoAuth('cadastro'));

formAuth.addEventListener('submit', async evento => {
  evento.preventDefault();
  if (!supabaseClient) return avisar('Configure a URL e a chave pública no arquivo src/config.js.', 'erro');
  const email = document.querySelector('#auth-email').value.trim().toLowerCase();
  const password = document.querySelector('#auth-senha').value;
  const submit = document.querySelector('#btn-auth-submit');
  submit.disabled = true;
  try {
    if (modoAuth === 'cadastro') {
      const nome = document.querySelector('#auth-nome').value.trim();
      const { data, error } = await supabaseClient.auth.signUp({
        email, password, options: { data: { full_name: nome } }
      });
      if (error) throw error;
      if (data.session) {
        avisar('Conta criada. Você entrou como aluno.');
      } else {
        avisar('Cadastro enviado. Confira seu e-mail para confirmar a conta e depois faça login.');
        mudarModoAuth('login');
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (error) {
    avisar(`Não foi possível autenticar: ${error.message}`, 'erro');
  } finally {
    submit.disabled = false;
  }
});

document.querySelector('#btn-sair').addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) avisar(`Não foi possível encerrar a sessão: ${error.message}`, 'erro');
  else avisar('Sessão encerrada com segurança.');
});

document.querySelector('#btn-atualizar').addEventListener('click', carregarPainel);
document.querySelector('#btn-novo-curso').addEventListener('click', () => {
  document.querySelector('#curso-id').value = '';
  document.querySelector('#titulo-curso-form').textContent = 'Novo curso';
  document.querySelector('#card-gerenciar-curso').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelector('#curso-nome').focus({ preventScroll: true });
});
document.querySelector('#buscar-cursos').addEventListener('input', renderizarCursos);
document.querySelector('#filtro-curso-status').addEventListener('change', renderizarCursos);

async function processarSessao(sessao) {
  if (!sessao) {
    sessaoAtual = null;
    perfilAtual = null;
    usuarioCarregado = null;
    painel.classList.add('oculto');
    telaAuth.classList.remove('oculto');
    document.querySelector('#sessao-resumo').classList.add('oculto');
    definirStatus(configuracaoValida ? 'Aguardando login' : 'Configure config.js');
    return;
  }
  if (usuarioCarregado === sessao.user.id && perfilAtual) return;
  sessaoAtual = sessao;
  definirStatus('Sessão autenticada', true);
  try {
    const { data, error } = await supabaseClient.from('profiles').select('id,nome,role').eq('id', sessao.user.id).single();
    if (error) throw error;
    perfilAtual = data;
    usuarioCarregado = sessao.user.id;
    await renderizarSessao();
  } catch (error) {
    await supabaseClient.auth.signOut();
    avisar(`Não foi possível carregar o perfil. Verifique se a migração sql/02_auth_rls.sql foi executada. ${error.message}`, 'erro');
  }
}

async function renderizarSessao() {
  telaAuth.classList.add('oculto');
  painel.classList.remove('oculto');
  document.querySelector('#sessao-resumo').classList.remove('oculto');
  document.querySelector('#usuario-atual').textContent = perfilAtual.nome || sessaoAtual.user.email;
  document.querySelector('#papel-atual').textContent = papelLegivel(perfilAtual.role);
  document.querySelector('#avatar-usuario').textContent = (perfilAtual.nome || sessaoAtual.user.email || 'U').trim().charAt(0).toUpperCase();
  document.querySelector('#resumo-papel').textContent = papelLegivel(perfilAtual.role);
  document.querySelector('#boas-vindas').textContent = `Olá, ${(perfilAtual.nome || 'usuário').split(' ')[0]}`;
  const descricoes = {
    administrador: 'Você administra perfis e pode gerir todos os cursos. As permissões também são validadas pelo RLS no banco.',
    professor: 'Você pode criar e gerenciar os cursos atribuídos à sua conta. O banco bloqueia alterações em cursos de outras pessoas.',
    aluno: 'Você pode consultar cursos ativos, matricular-se e consultar suas próprias matrículas.'
  };
  document.querySelector('#descricao-papel').textContent = descricoes[perfilAtual.role] || 'Seu perfil ainda não tem permissões atribuídas.';
  const podeGerenciar = ['professor', 'administrador'].includes(perfilAtual.role);
  document.querySelector('#card-gerenciar-curso').classList.toggle('oculto', !podeGerenciar);
  document.querySelector('#card-matriculas').classList.toggle('oculto', perfilAtual.role !== 'aluno');
  document.querySelector('#card-usuarios').classList.toggle('oculto', perfilAtual.role !== 'administrador');
  document.querySelector('#btn-novo-curso').classList.toggle('oculto', !podeGerenciar);
  document.querySelector('#texto-cursos').textContent = perfilAtual.role === 'aluno' ? 'Disponíveis para você' : 'Visíveis pelo seu perfil';
  await carregarPainel();
}

async function carregarPainel() {
  if (!sessaoAtual || !perfilAtual) return;
  await carregarCursos();
  if (perfilAtual.role === 'aluno') await carregarMatriculas();
  if (perfilAtual.role === 'administrador') await carregarPerfis();
}

async function carregarCursos() {
  const { data, error } = await supabaseClient.from('cursos').select('id,nome,descricao,carga_horaria,ativo,professor_id').order('nome');
  if (error) {
    listaCursos.innerHTML = `<p class="course-empty">Falha ao carregar cursos: ${escapar(error.message)}</p>`;
    avisar(`Erro ao carregar cursos: ${error.message}`, 'erro');
    return;
  }
  cursosAtuais = data || [];
  renderizarCursos();
}

function renderizarCursos() {
  const termo = document.querySelector('#buscar-cursos').value.trim().toLocaleLowerCase('pt-BR');
  const filtro = document.querySelector('#filtro-curso-status').value;
  cursosFiltrados = cursosAtuais.filter(curso => {
    const texto = `${curso.nome} ${curso.descricao || ''}`.toLocaleLowerCase('pt-BR');
    const buscaOk = texto.includes(termo);
    const statusOk = filtro === 'todos' || (filtro === 'ativos' && curso.ativo) || (filtro === 'inativos' && !curso.ativo);
    return buscaOk && statusOk;
  });
  document.querySelector('#numero-cursos').textContent = String(cursosAtuais.length);
  if (!cursosFiltrados.length) {
    listaCursos.innerHTML = `<p class="course-empty">${cursosAtuais.length ? 'Nenhum curso corresponde à busca.' : 'Ainda não há cursos para exibir.'}</p>`;
    return;
  }
  listaCursos.innerHTML = cursosFiltrados.map(curso => {
    let acao = '<span class="muted">—</span>';
    if (perfilAtual.role === 'aluno') {
      acao = curso.ativo ? `<button class="button button-primary" data-acao="matricular" data-id="${curso.id}">Matricular <span aria-hidden="true">→</span></button>` : '';
    } else if (perfilAtual.role === 'administrador' || (perfilAtual.role === 'professor' && curso.professor_id === sessaoAtual.user.id)) {
      acao = `<button class="button button-quiet" data-acao="editar-curso" data-id="${curso.id}">Editar</button>`;
    }
    const statusClass = curso.ativo ? '' : ' inactive';
    return `<article class="course-card"><div class="course-main"><div class="course-topline"><h3>${escapar(curso.nome)}</h3><span class="course-status${statusClass}">${curso.ativo ? 'Disponível' : 'Indisponível'}</span></div><p>${escapar(curso.descricao || 'Uma trilha de aprendizagem para avançar no seu ritmo.')}</p><div class="course-meta"><span aria-label="Carga horária">◷ ${Number(curso.carga_horaria)} horas</span></div></div><div class="course-action">${acao}</div></article>`;
  }).join('');
}

listaCursos.addEventListener('click', async evento => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;
  const curso = cursosAtuais.find(item => String(item.id) === botao.dataset.id);
  if (!curso) return;
  if (botao.dataset.acao === 'editar-curso') return prepararEdicaoCurso(curso);
  if (botao.dataset.acao === 'matricular') {
    botao.disabled = true;
    const { error } = await supabaseClient.from('matriculas_auth').insert({ aluno_id: sessaoAtual.user.id, curso_id: curso.id });
    if (error) avisar(error.code === '23505' ? 'Você já está matriculado neste curso.' : `Não foi possível matricular: ${error.message}`, 'erro');
    else { avisar(`Matrícula em “${curso.nome}” realizada.`); await carregarMatriculas(); }
    botao.disabled = false;
  }
});

function resetarCurso() {
  document.querySelector('#form-curso').reset();
  document.querySelector('#curso-id').value = '';
  document.querySelector('#curso-carga').value = 20;
  document.querySelector('#curso-ativo').checked = true;
  document.querySelector('#titulo-curso-form').textContent = 'Novo curso';
  document.querySelector('#btn-cancelar-curso').classList.add('oculto');
}

function prepararEdicaoCurso(curso) {
  document.querySelector('#curso-id').value = curso.id;
  document.querySelector('#curso-nome').value = curso.nome;
  document.querySelector('#curso-descricao').value = curso.descricao || '';
  document.querySelector('#curso-carga').value = curso.carga_horaria;
  document.querySelector('#curso-ativo').checked = curso.ativo;
  if (perfilAtual.role === 'administrador') document.querySelector('#curso-professor').value = curso.professor_id || '';
  document.querySelector('#titulo-curso-form').textContent = 'Editar curso';
  document.querySelector('#btn-cancelar-curso').classList.remove('oculto');
  document.querySelector('#card-gerenciar-curso').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('#btn-cancelar-curso').addEventListener('click', resetarCurso);

document.querySelector('#form-curso').addEventListener('submit', async evento => {
  evento.preventDefault();
  if (!['professor', 'administrador'].includes(perfilAtual?.role)) return avisar('Seu perfil não pode gerenciar cursos.', 'erro');
  const id = document.querySelector('#curso-id').value;
  const professorId = perfilAtual.role === 'professor' ? sessaoAtual.user.id : (document.querySelector('#curso-professor').value || null);
  const valores = {
    nome: document.querySelector('#curso-nome').value.trim(),
    descricao: document.querySelector('#curso-descricao').value.trim() || null,
    carga_horaria: Number(document.querySelector('#curso-carga').value),
    ativo: document.querySelector('#curso-ativo').checked,
    professor_id: professorId
  };
  const resposta = id
    ? await supabaseClient.from('cursos').update(valores).eq('id', id)
    : await supabaseClient.from('cursos').insert(valores);
  if (resposta.error) return avisar(`Não foi possível salvar o curso: ${resposta.error.message}`, 'erro');
  avisar(id ? 'Curso atualizado.' : 'Curso criado.');
  resetarCurso();
  await carregarCursos();
});

async function carregarMatriculas() {
  const { data, error } = await supabaseClient.from('matriculas_auth').select('id,curso_id,status,data_matricula').eq('aluno_id', sessaoAtual.user.id).order('data_matricula', { ascending: false });
  if (error) {
    tabelaMatriculas.innerHTML = `<tr><td colspan="3">Falha ao carregar matrículas: ${escapar(error.message)}</td></tr>`;
    return;
  }
  if (!data?.length) {
    tabelaMatriculas.innerHTML = '<tr><td colspan="3">Você ainda não tem matrículas.</td></tr>';
    return;
  }
  const ids = data.map(item => item.curso_id);
  const { data: cursos, error: erroCursos } = await supabaseClient.from('cursos').select('id,nome').in('id', ids);
  const nomes = new Map((cursos || []).map(curso => [curso.id, curso.nome]));
  if (erroCursos) avisar(`Alguns nomes de cursos não puderam ser carregados: ${erroCursos.message}`, 'erro');
  tabelaMatriculas.innerHTML = data.map(m => `<tr><td>${escapar(nomes.get(m.curso_id) || `Curso #${m.curso_id}`)}</td><td><span class="status ${escapar(m.status)}">${escapar(m.status)}</span></td><td>${escapar(m.data_matricula)}</td></tr>`).join('');
}

async function carregarPerfis() {
  const { data, error } = await supabaseClient.from('profiles').select('id,nome,role').order('nome');
  if (error) {
    tabelaUsuarios.innerHTML = `<tr><td colspan="4">Falha ao listar perfis: ${escapar(error.message)}</td></tr>`;
    return;
  }
  perfisVisiveis = data || [];
  const professores = perfisVisiveis.filter(p => p.role === 'professor');
  const seletor = document.querySelector('#curso-professor');
  seletor.innerHTML = '<option value="">Sem professor atribuído</option>' + professores.map(p => `<option value="${p.id}">${escapar(p.nome || p.id)}</option>`).join('');
  document.querySelector('#campo-professor-wrap').classList.remove('oculto');
  if (!perfisVisiveis.length) {
    tabelaUsuarios.innerHTML = '<tr><td colspan="4">Nenhum perfil.</td></tr>';
    return;
  }
  tabelaUsuarios.innerHTML = perfisVisiveis.map(p => {
    const nome = p.nome || p.id;
    if (p.id === sessaoAtual.user.id) return `<tr><td>${escapar(nome)} <span class="muted">(você)</span></td><td class="id-curto">${escapar(p.id)}</td><td>${papelLegivel(p.role)}</td><td>Protegido</td></tr>`;
    return `<tr><td>${escapar(nome)}</td><td class="id-curto">${escapar(p.id)}</td><td><select data-role-id="${p.id}" aria-label="Novo papel para ${escapar(nome)}"><option value="aluno" ${p.role === 'aluno' ? 'selected' : ''}>Aluno</option><option value="professor" ${p.role === 'professor' ? 'selected' : ''}>Professor</option><option value="administrador" ${p.role === 'administrador' ? 'selected' : ''}>Administrador</option></select></td><td><button class="secundario" data-acao="salvar-papel" data-id="${p.id}">Salvar papel</button></td></tr>`;
  }).join('');
}

tabelaUsuarios.addEventListener('click', async evento => {
  const botao = evento.target.closest('button[data-acao="salvar-papel"]');
  if (!botao || perfilAtual.role !== 'administrador') return;
  const perfil = perfisVisiveis.find(item => item.id === botao.dataset.id);
  const novoRole = tabelaUsuarios.querySelector(`[data-role-id="${CSS.escape(botao.dataset.id)}"]`)?.value;
  if (!perfil || !['aluno', 'professor', 'administrador'].includes(novoRole)) return;
  const { error } = await supabaseClient.from('profiles').update({ role: novoRole }).eq('id', perfil.id);
  if (error) return avisar(`Não foi possível alterar o perfil: ${error.message}`, 'erro');
  avisar(`Perfil atualizado para ${papelLegivel(novoRole)}.`);
  await carregarPerfis();
});

if (!supabaseClient) {
  definirStatus('Configure src/config.js');
  avisar('A URL ou a chave pública do Supabase não foi configurada.', 'erro');
} else {
  definirStatus('Conectando ao Supabase...');
  supabaseClient.auth.onAuthStateChange((_evento, sessao) => {
    // Evita chamadas de rede dentro do lock interno do callback de Auth.
    setTimeout(() => processarSessao(sessao), 0);
  });
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) avisar(`Erro ao restaurar sessão: ${error.message}`, 'erro');
    processarSessao(data?.session || null);
  });
}
