// Troque pelo IP da sua máquina na rede local ao rodar em dispositivo físico
// Ex: 'http://192.168.1.100:5001'
// Em emulador Android use: 'http://10.0.2.2:5001'
export const BASE_URL = 'http://localhost:5001';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return data as T;
}

// --- Auth ---

export async function login(email: string, password: string): Promise<string> {
  const data = await request<{ token: string }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return data.token;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

// --- Glicemia ---

export interface GlicemiaRecord {
  id: number;
  valor_mgdl: number;
  created_at: string;
}

export async function getGlicemia(): Promise<GlicemiaRecord[]> {
  return request<GlicemiaRecord[]>('/api/glycemia');
}

export async function registrarGlicemia(valor_mgdl: number): Promise<void> {
  await request('/api/glycemia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor_mgdl }),
  });
}

// --- Refeições ---

export interface Componente {
  nome: string;
  porcao_g: number;
  carboidratos_g: number;
}

export interface Meal {
  id: number;
  total_carboidratos_g: number;
  bolus_total_u: number;
  observation: string;
  created_at: string;
  componentes: Componente[];
}

export async function getMeals(): Promise<Meal[]> {
  return request<Meal[]>('/api/meals');
}

// --- Análise de prato ---

export interface AnaliseResult {
  message: string;
  meal_id: number;
  analise_refeicao: {
    refeicao_detectada: string;
    componentes: Componente[];
    total_carboidratos_g: number;
    observacoes: string;
  };
  calculo_insulina: {
    bolus_refeicao_u: number;
    bolus_correcao_u: number;
    bolus_total_u: number;
    detalhes: {
      total_carboidratos_g: number;
      glicemia_atual_mgdl: number;
      glicemia_alvo_mgdl: number;
      ratio_carb: number;
      fator_correcao: number;
    };
  };
}

export async function analisarPrato(
  imagemUri: string,
  glicemiaAtual: number,
  glicemiaAlvo = 100,
  ratioCarb = 15,
  fatorCorrecao = 40,
): Promise<AnaliseResult> {
  const form = new FormData();
  form.append('imagem', {
    uri: imagemUri,
    type: 'image/jpeg',
    name: 'prato.jpg',
  } as any);
  form.append('glicemia_atual', String(glicemiaAtual));
  form.append('glicemia_alvo', String(glicemiaAlvo));
  form.append('ratio_carb', String(ratioCarb));
  form.append('fator_correcao', String(fatorCorrecao));

  return request<AnaliseResult>('/api/insulin/calcular', {
    method: 'POST',
    body: form,
  });
}
