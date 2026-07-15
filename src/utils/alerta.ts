import { AppColors } from '../theme/themes';
import { Alerta } from '../services/api';

export function alertaVisual(nivel: Alerta['nivel'], colors: AppColors) {
  switch (nivel) {
    case 'hipoglicemia':
      return { color: colors.red, icon: 'arrow-down-circle', label: 'Hipoglicemia' };
    case 'critica':
      return { color: colors.red, icon: 'alert-octagon', label: 'Crítica' };
    case 'alta':
      return { color: colors.orange, icon: 'arrow-up-circle', label: 'Alta' };
    case 'atencao':
      return { color: colors.yellow, icon: 'alert-circle-outline', label: 'Atenção' };
    case 'normal':
    default:
      return { color: colors.green, icon: 'check-circle-outline', label: 'Normal' };
  }
}

export function precisaAtencao(nivel: Alerta['nivel']) {
  return nivel !== 'normal';
}

// espelha classificar_glicemia() do backend (blueprints/glycemia.py) — só
// existe pq a média é calculada aqui no cliente e não vem com alerta pronto.
// se mudar os limites lá, muda aqui também
export function classificarNivel(valor: number): Alerta['nivel'] {
  if (valor < 70) return 'hipoglicemia';
  if (valor <= 99) return 'normal';
  if (valor <= 180) return 'atencao';
  if (valor <= 250) return 'alta';
  return 'critica';
}
