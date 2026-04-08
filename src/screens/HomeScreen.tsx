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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeStackParamList } from '../navigation/HomeStack';
import { useAuth } from '../context/AuthContext';
import { getGlicemia, getMeals, GlicemiaRecord, Meal } from '../services/api';
import colors from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
};

const actions = [
  { label: 'Análise de\nPrato', icon: 'camera-outline', color: colors.cyan, screen: 'AnaliseDePrato' },
  { label: 'Relatório\nMensal', icon: 'file-document-outline', color: colors.purple, screen: 'RelatorioMensal' },
  { label: 'Lembretes', icon: 'bell-outline', color: colors.orange, screen: 'Lembretes' },
  { label: 'Chat Amigo', icon: 'message-outline', color: colors.pink, screen: 'Chat' },
  { label: 'Minhas\nMetas', icon: 'bullseye-arrow', color: colors.yellow, screen: 'MinhasMetas' },
  { label: 'Loja Glico', icon: 'gift-outline', color: colors.red, screen: 'LojaGlico' },
  { label: 'Diário', icon: 'book-open-outline', color: colors.blue, screen: null },
  { label: 'Contar\nCarbo', icon: 'silverware-fork-knife', color: colors.cyan, screen: null },
];

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [glicemia, setGlicemia] = useState<GlicemiaRecord[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, m] = await Promise.all([getGlicemia(), getMeals()]);
      setGlicemia(g);
      setMeals(m);
    } catch {
      // falha silenciosa, mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Últimos 7 registros de glicemia para o gráfico
  const chartData = glicemia.slice(-7);
  const chartMax = Math.max(...chartData.map(r => r.valor_mgdl), 200);
  const chartMin = Math.min(...chartData.map(r => r.valor_mgdl), 60);
  const chartRange = chartMax - chartMin || 1;

  // Média de glicemia
  const mediaGlicemia =
    glicemia.length > 0
      ? Math.round(glicemia.reduce((s, r) => s + r.valor_mgdl, 0) / glicemia.length)
      : null;

  // Dados de hoje
  const todayGlicemia = glicemia.filter(r => isToday(r.created_at));
  const lastGlicemia = todayGlicemia[todayGlicemia.length - 1];
  const todayMeals = meals.filter(m => isToday(m.created_at));
  const totalCarbosHoje = todayMeals.reduce((s, m) => s + m.total_carboidratos_g, 0);

  // Primeira letra do nome ou email para o avatar
  const displayName = user?.name || user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'G';
  const firstName = displayName.split(' ')[0] || 'Usuário';

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.green} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={colors.green}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>
          <Text style={styles.subGreeting}>Vamos cuidar da saúde hoje?</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={signOut}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      {/* Card Glicemia */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Média de Glicemia</Text>
          <Text style={styles.glicemiaValue}>
            {mediaGlicemia !== null ? `${mediaGlicemia} mg/dL` : '—'}
          </Text>
        </View>
        {chartData.length > 0 ? (
          <>
            <View style={styles.chart}>
              {chartData.map((r, i) => {
                const pct = (r.valor_mgdl - chartMin) / chartRange;
                const top = (1 - pct) * 48;
                return (
                  <View key={i} style={styles.chartCol}>
                    <View style={[styles.chartDot, { marginTop: top }]} />
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLabels}>
              {chartData.map((r, i) => (
                <Text key={i} style={styles.chartLabel}>
                  {DAY_LABELS[new Date(r.created_at).getDay()]}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhum registro ainda</Text>
        )}
      </View>

      {/* Resumo do Dia */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumo do Dia</Text>
        <View style={styles.resumoRow}>
          <View>
            <Text style={styles.resumoValue}>
              {lastGlicemia ? lastGlicemia.valor_mgdl : '—'}
            </Text>
            <Text style={styles.resumoLabel}>Glicemia</Text>
          </View>
          <View>
            <Text style={styles.resumoValue}>
              {totalCarbosHoje > 0 ? `${totalCarbosHoje}g` : '—'}
            </Text>
            <Text style={styles.resumoLabel}>Carbos hoje</Text>
          </View>
        </View>
      </View>

      {/* O que vamos fazer? */}
      <Text style={styles.actionsTitle}>O que vamos fazer?</Text>
      <View style={styles.grid}>
        {actions.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => item.screen && (navigation as any).navigate(item.screen)}>
            <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  subGreeting: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
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
    marginBottom: 12,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  glicemiaValue: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '700',
  },
  chart: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  chartLabel: {
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  resumoRow: {
    flexDirection: 'row',
    gap: 32,
  },
  resumoValue: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  resumoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actionsTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '47%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
