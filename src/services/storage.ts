import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const raw = await AsyncStorage.getItem(LEMBRETES_KEY);
  if (!raw) return defaultLembretes;
  return JSON.parse(raw);
}

export async function saveLembretes(lembretes: Lembrete[]): Promise<void> {
  await AsyncStorage.setItem(LEMBRETES_KEY, JSON.stringify(lembretes));
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
  const raw = await AsyncStorage.getItem(DIARIO_KEY);
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
  await AsyncStorage.setItem(DIARIO_KEY, JSON.stringify(atual));
}

export async function deleteEntrada(id: string): Promise<void> {
  const atual = await getEntradas();
  await AsyncStorage.setItem(DIARIO_KEY, JSON.stringify(atual.filter(e => e.id !== id)));
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
  await AsyncStorage.setItem(ANALISE_KEY, JSON.stringify(analise));
}

export async function getUltimaAnalise(): Promise<UltimaAnalise | null> {
  const raw = await AsyncStorage.getItem(ANALISE_KEY);
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
  const raw = await AsyncStorage.getItem(HISTORICO_CARBO_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function salvarSessaoCarbo(sessao: SessaoCarbo): Promise<void> {
  const atual = await getSessoesCarbo();
  await AsyncStorage.setItem(HISTORICO_CARBO_KEY, JSON.stringify([sessao, ...atual]));
}

export async function deletarSessaoCarbo(id: string): Promise<void> {
  const atual = await getSessoesCarbo();
  await AsyncStorage.setItem(HISTORICO_CARBO_KEY, JSON.stringify(atual.filter(s => s.id !== id)));
}

// --- Metas customizadas ---

export interface MetaCustom {
  id: string;
  nome: string;
  freq: string;
  icon: string;
  concluida: boolean;
}

const METAS_KEY = '@glicoguide:metas';

export async function getMetasCustom(): Promise<MetaCustom[]> {
  const raw = await AsyncStorage.getItem(METAS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveMetasCustom(metas: MetaCustom[]): Promise<void> {
  await AsyncStorage.setItem(METAS_KEY, JSON.stringify(metas));
}
