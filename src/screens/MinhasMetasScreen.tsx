import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getGlicemia, getMeals } from '../services/api';
import colors from '../theme/colors';

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function MinhasMetasScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [glicemiaHoje, setGlicemiaHoje] = useState(0);
  const [refeicoesSemana, setRefeicoesSemana] = useState(0);
  const [mediaCarbs, setMediaCarbs] = useState(0);
  // Metas manuais (toggle local)
  const [aguaConcluida, setAguaConcluida] = useState(false);
  const [atividadeConcluida, setAtividadeConcluida] = useState(false);

  const load = useCallback(async () => {
    try {
      const [glicemia, meals] = await Promise.all([getGlicemia(), getMeals()]);

      const hoje = glicemia.filter(r => isToday(r.created_at)).length;
      setGlicemiaHoje(hoje);

      const agora = new Date();
      const semanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mealsSemana = meals.filter(m => new Date(m.created_at) >= semanaAtras);
      setRefeicoesSemana(mealsSemana.length);

      if (meals.length > 0) {
        const media = Math.round(
          meals.reduce((s, m) => s + m.total_carboidratos_g, 0) / meals.length,
        );
        setMediaCarbs(media);
      }
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const metas = [
    {
      id: 'glicemia',
      nome: 'Medir Glicemia Hoje',
      freq: 'Diário',
      progresso: glicemiaHoje,
      total: 3,
      unidade: ' medições',
      concluida: glicemiaHoje >= 3,
      automatica: true,
    },
    {
      id: 'refeicoes',
      nome: 'Registrar Refeições (semana)',
      freq: 'Semanal',
      progresso: refeicoesSemana,
      total: 7,
      unidade: ' refeições',
      concluida: refeicoesSemana >= 7,
      automatica: true,
    },
    {
      id: 'carbs',
      nome: 'Manter Carbos abaixo de 60g',
      freq: 'Por refeição',
      progresso: mediaCarbs > 0 ? (mediaCarbs <= 60 ? 1 : 0) : 0,
      total: 1,
      unidade: mediaCarbs > 0 ? ` (média: ${mediaCarbs}g)` : '',
      concluida: mediaCarbs > 0 && mediaCarbs <= 60,
      automatica: true,
    },
    {
      id: 'agua',
      nome: 'Beber 2L de água',
      freq: 'Diário',
      progresso: aguaConcluida ? 1 : 0,
      total: 1,
      unidade: '',
      concluida: aguaConcluida,
      automatica: false,
      onToggle: () => setAguaConcluida(v => !v),
    },
    {
      id: 'atividade',
      nome: 'Atividade Física 30min',
      freq: 'Diário',
      progresso: atividadeConcluida ? 1 : 0,
      total: 1,
      unidade: '',
      concluida: atividadeConcluida,
      automatica: false,
      onToggle: () => setAtividadeConcluida(v => !v),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={colors.green}
        />
      }>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Minhas Metas</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Acompanhe seu progresso!</Text>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
      ) : (
        metas.map(meta => {
          const pct = meta.total > 0 ? meta.progresso / meta.total : 0;
          return (
            <TouchableOpacity
              key={meta.id}
              style={styles.card}
              onPress={meta.onToggle}
              disabled={meta.automatica}
              activeOpacity={meta.automatica ? 1 : 0.7}>
              <View style={styles.cardHeader}>
                <Text style={styles.metaNome}>{meta.nome}</Text>
                {meta.concluida ? (
                  <Text style={styles.checkIcon}>✅</Text>
                ) : (
                  <View style={[
                    styles.emptyCircle,
                    !meta.automatica && { borderColor: colors.green },
                  ]} />
                )}
              </View>
              <Text style={styles.freq}>
                {meta.freq}
                {!meta.automatica && <Text style={styles.tapHint}> · toque para marcar</Text>}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(pct * 100, 100)}%`,
                      backgroundColor: meta.concluida ? colors.green : colors.blue,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {meta.progresso}/{meta.total}{meta.unidade}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  back: {
    marginTop: 16,
    marginBottom: 4,
  },
  backText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaNome: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkIcon: {
    fontSize: 18,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  freq: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  tapHint: {
    color: colors.green,
    fontSize: 11,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },
});
