import { getSecureItem, setSecureItem } from './secureStorage';

// --- Lembretes ---

export interface Lembrete {
  id: string;
  nome: string;
  horario: string;
  ativo: boolean;
  icon: string;
}

const LEMBRETES_KEY = '@glicoguide:lembretes';

const defaultLembretes: Lembrete[] = [
  { id: '1', nome: 'Lantus (Basal)', horario: '20:00', ativo: true, icon: 'needle' },
  { id: '2', nome: 'Medir Glicemia', horario: '07:00', ativo: true, icon: 'water-outline' },
  { id: '3', nome: 'Novorapid (Almoço)', horario: '12:30', ativo: false, icon: 'needle' },
];

export async function getLembretes(): Promise<Lembrete[]> {
  const raw = await getSecureItem(LEMBRETES_KEY);
  if (!raw) return defaultLembretes;
  return JSON.parse(raw);
}

export async function saveLembretes(lembretes: Lembrete[]): Promise<void> {
  await setSecureItem(LEMBRETES_KEY, JSON.stringify(lembretes));
}

// --- Diário ---

export interface EntradaDiario {
  id: string;
  data: string; // ISO string
  texto: string;
  humor: 'otimo' | 'bom' | 'neutro' | 'ruim' | 'pessimo';
}

const DIARIO_KEY = '@glicoguide:diario';

export async function getEntradas(): Promise<EntradaDiario[]> {
  const raw = await getSecureItem(DIARIO_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveEntrada(entrada: EntradaDiario): Promise<void> {
  const atual = await getEntradas();
  const idx = atual.findIndex(e => e.id === entrada.id);
  if (idx >= 0) {
    atual[idx] = entrada;
  } else {
    atual.unshift(entrada);
  }
  await setSecureItem(DIARIO_KEY, JSON.stringify(atual));
}

export async function deleteEntrada(id: string): Promise<void> {
  const atual = await getEntradas();
  await setSecureItem(DIARIO_KEY, JSON.stringify(atual.filter(e => e.id !== id)));
}

// --- Última análise de prato (AI) ---

export interface ComponenteIA {
  nome: string;
  porcao_g: number;
  carboidratos_g: number;
}

export interface UltimaAnalise {
  data: string;
  componentes: ComponenteIA[];
  total_carboidratos_g: number;
  observacoes: string;
}

const ANALISE_KEY = '@glicoguide:ultima_analise';

export async function salvarUltimaAnalise(analise: UltimaAnalise): Promise<void> {
  await setSecureItem(ANALISE_KEY, JSON.stringify(analise));
}

export async function getUltimaAnalise(): Promise<UltimaAnalise | null> {
  const raw = await getSecureItem(ANALISE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// --- Histórico do Contador de Carbo ---

export interface ItemHistorico {
  nome: string;
  porcao_g: number;
  carboidratos_g: number;
  origem: 'manual' | 'ia';
}

export interface SessaoCarbo {
  id: string;
  data: string; // ISO string
  itens: ItemHistorico[];
  total_carboidratos_g: number;
  bolus_estimado_u: number;
  ratio: number;
}

const HISTORICO_CARBO_KEY = '@glicoguide:historico_carbo';

export async function getSessoesCarbo(): Promise<SessaoCarbo[]> {
  const raw = await getSecureItem(HISTORICO_CARBO_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function salvarSessaoCarbo(sessao: SessaoCarbo): Promise<void> {
  const atual = await getSessoesCarbo();
  await setSecureItem(HISTORICO_CARBO_KEY, JSON.stringify([sessao, ...atual]));
}

export async function deletarSessaoCarbo(id: string): Promise<void> {
  const atual = await getSessoesCarbo();
  await setSecureItem(HISTORICO_CARBO_KEY, JSON.stringify(atual.filter(s => s.id !== id)));
}

// --- Metas customizadas ---

export interface MetaCustom {
  id: string;
  nome: string;
  freq: string;
  icon: string;
  concluida: boolean;
  pontosCreditados?: boolean;
}

const METAS_KEY = '@glicoguide:metas';

export async function getMetasCustom(): Promise<MetaCustom[]> {
  const raw = await getSecureItem(METAS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveMetasCustom(metas: MetaCustom[]): Promise<void> {
  await setSecureItem(METAS_KEY, JSON.stringify(metas));
}

// --- Metas diárias fixas (água / atividade) ---

export interface MetaDiariaStatus {
  concluida: boolean;
  pontosCreditados: boolean;
  data: string; // yyyy-mm-dd, usado para resetar a cada novo dia
}

export interface MetasDiariasState {
  agua: MetaDiariaStatus;
  atividade: MetaDiariaStatus;
}

const METAS_DIARIAS_KEY = '@glicoguide:metas_diarias';

function hojeStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function metaDiariaVazia(): MetaDiariaStatus {
  return { concluida: false, pontosCreditados: false, data: hojeStr() };
}

export async function getMetasDiarias(): Promise<MetasDiariasState> {
  const raw = await getSecureItem(METAS_DIARIAS_KEY);
  if (!raw) return { agua: metaDiariaVazia(), atividade: metaDiariaVazia() };

  // compara a data salva com hoje — se mudou o dia, volta pra "vazia"
  // em vez de deixar a meta de ontem marcada como concluída

  const parsed: MetasDiariasState = JSON.parse(raw);
  const hoje = hojeStr();
  return {
    agua: parsed.agua?.data === hoje ? parsed.agua : metaDiariaVazia(),
    atividade: parsed.atividade?.data === hoje ? parsed.atividade : metaDiariaVazia(),
  };
}

export async function saveMetasDiarias(state: MetasDiariasState): Promise<void> {
  await setSecureItem(METAS_DIARIAS_KEY, JSON.stringify(state));
}
