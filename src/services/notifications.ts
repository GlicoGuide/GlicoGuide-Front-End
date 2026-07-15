import notifee, { AndroidImportance, RepeatFrequency, TriggerType } from '@notifee/react-native';
import { Lembrete } from './storage';

const CHANNEL_ID = 'lembretes';

let canalCriado = false;

async function garantirCanal() {
  if (canalCriado) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Lembretes',
    importance: AndroidImportance.HIGH,
  });
  canalCriado = true;
}

export async function solicitarPermissaoNotificacao(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; // AUTHORIZED ou PROVISIONAL
}

function idNotificacao(lembreteId: string) {
  return `lembrete-${lembreteId}`;
}

export async function cancelarNotificacao(lembreteId: string) {
  await notifee.cancelNotification(idNotificacao(lembreteId));
}

export async function agendarNotificacao(lembrete: Lembrete) {
  // sempre cancela antes de reagendar — evita duplicar notificação quando
  // o horário do lembrete é editado

  await cancelarNotificacao(lembrete.id);
  if (!lembrete.ativo) return;

  const [hora, minuto] = lembrete.horario.split(':').map(Number);
  if (Number.isNaN(hora) || Number.isNaN(minuto)) return;

  // se o horário de hoje já passou, agenda pra amanhã (o repeatFrequency
  // DAILY cuida do resto a partir daí)

  const disparo = new Date();
  disparo.setHours(hora, minuto, 0, 0);
  if (disparo.getTime() <= Date.now()) {
    disparo.setDate(disparo.getDate() + 1);
  }

  await garantirCanal();
  await notifee.createTriggerNotification(
    {
      id: idNotificacao(lembrete.id),
      title: 'GlicoGuide',
      body: lembrete.nome,
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: disparo.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
}

export async function sincronizarNotificacoes(lembretes: Lembrete[]): Promise<void> {
  await garantirCanal();
  for (const lembrete of lembretes) {
    await agendarNotificacao(lembrete);
  }
}
