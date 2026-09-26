// URL do projeto e chave pública (publishable/anon). Não use service_role no navegador.
const SUPABASE_URL = 'https://nugbnsladhpfknupqlum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sWHjEcXa-xDeYJwgdV8RWw_xxK6f-is';

const configuracaoValida =
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !SUPABASE_ANON_KEY.includes('COLE_AQUI');

const supabaseClient = configuracaoValida && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;
