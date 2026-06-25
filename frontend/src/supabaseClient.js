import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://zdhwjsolzaubgijiemvi.supabase.co';
// Anon key (sb_publishable_*) — chave pública, segura para o frontend
// NUNCA coloque a service_role key aqui
const SUPABASE_ANON = 'sb_publishable_dacZ8n6dZRt96PGzVsQQNA_C9qSNWKb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
