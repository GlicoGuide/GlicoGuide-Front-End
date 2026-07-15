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
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeStackParamList } from '../navigation/HomeStack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getGlicemia, getMeals, GlicemiaRecord, Meal } from '../services/api';
import { alertaVisual, precisaAtencao } from '../utils/alerta';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
};

const actions = [
  { label: 'Análise de\nPrato', icon: 'camera-outline', colorKey: 'cyan', screen: 'AnaliseDePrato' },
  { label: 'Relatório\nMensal', icon: 'file-document-outline', colorKey: 'purple', screen: 'RelatorioMensal' },
  { label: 'Lembretes', icon: 'bell-outline', colorKey: 'orange', screen: 'Lembretes' },
  { label: 'Chat Amigo', icon: 'message-outline', colorKey: 'pink', screen: 'Chat' },
  { label: 'Minhas\nMetas', icon: 'bullseye-arrow', colorKey: 'yellow', screen: 'MinhasMetas' },
  { label: 'Loja Glico', icon: 'gift-outline', colorKey: 'red', screen: 'LojaGlico' },
  { label: 'Diário', icon: 'book-open-outline', colorKey: 'blue', screen: 'Diario' },
  { label: 'Contar\nCarbo', icon: 'silverware-fork-knife', colorKey: 'cyan', screen: 'ContarCarbo' },
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
  const { user } = useAuth();
  const { colors } = useTheme();
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
      // falha silenciosa
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const chartData = glicemia.slice(-7);
  const chartMax = Math.max(...chartData.map(r => r.valor_mgdl), 200);
  const chartMin = Math.min(...chartData.map(r => r.valor_mgdl), 60);
  const chartRange = chartMax - chartMin || 1;

  const mediaGlicemia =
    glicemia.length > 0
      ? Math.round(glicemia.reduce((s, r) => s + r.valor_mgdl, 0) / glicemia.length)
      : null;

  const todayGlicemia = glicemia.filter(r => isToday(r.created_at));
  const lastGlicemia = todayGlicemia[todayGlicemia.length - 1];
  const ultimoRegistro = glicemia[0];
  const todayMeals = meals.filter(m => isToday(m.created_at));
  const totalCarbosHoje = todayMeals.reduce((s, m) => s + m.total_carboidratos_g, 0);

  const displayName = user?.name || user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'G';
  const firstName = displayName.split(' ')[0] || 'Usuário';

  const s = makeStyles(colors);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={colors.green}
        />
      }>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Olá, {firstName}!</Text>
          <Text style={s.subGreeting}>Vamos cuidar da saúde hoje?</Text>
        </View>
        <TouchableOpacity
          style={s.avatar}
          onPress={() => (navigation as any).navigate('Perfil')}>
          <Text style={s.avatarText}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      {/* Alerta de glicemia */}
      {ultimoRegistro && precisaAtencao(ultimoRegistro.alerta.nivel) && (
        <View style={[s.alertBanner, { backgroundColor: alertaVisual(ultimoRegistro.alerta.nivel, colors).color + '22' }]}>
          <MaterialCommunityIcons
            name={alertaVisual(ultimoRegistro.alerta.nivel, colors).icon}
            size={22}
            color={alertaVisual(ultimoRegistro.alerta.nivel, colors).color}
          />
          <Text style={[s.alertText, { color: alertaVisual(ultimoRegistro.alerta.nivel, colors).color }]}>
            {ultimoRegistro.alerta.mensagem}
          </Text>
        </View>
      )}

      {/* Card Glicemia */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardLabel}>Média de Glicemia</Text>
          <Text style={s.glicemiaValue}>
            {mediaGlicemia !== null ? `${mediaGlicemia} mg/dL` : '—'}
          </Text>
        </View>
        {chartData.length > 0 ? (
          <>
            <View style={s.chart}>
              {chartData.map((r, i) => {
                const pct = (r.valor_mgdl - chartMin) / chartRange;
                const top = (1 - pct) * 48;
                return (
                  <View key={i} style={s.chartCol}>
                    <View style={[s.chartDot, { marginTop: top }]} />
                  </View>
                );
              })}
            </View>
            <View style={s.chartLabels}>
              {chartData.map((r, i) => (
                <Text key={i} style={s.chartLabel}>
                  {DAY_LABELS[new Date(r.created_at).getDay()]}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <Text style={s.emptyText}>Nenhum registro ainda</Text>
        )}
      </View>

      {/* Resumo do Dia */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Resumo do Dia</Text>
        <View style={s.resumoRow}>
          <View style={s.resumoItem}>
            <MaterialCommunityIcons name="water-outline" size={20} color={colors.textMuted} />
            <Text style={s.resumoValue}>
              {lastGlicemia ? lastGlicemia.valor_mgdl : '—'}
            </Text>
            <Text style={s.resumoLabel}>Glicemia</Text>
          </View>
          <View style={s.resumoItem}>
            <MaterialCommunityIcons name="food-apple-outline" size={20} color={colors.textMuted} />
            <Text style={s.resumoValue}>
              {totalCarbosHoje > 0 ? `${totalCarbosHoje}g` : '—'}
            </Text>
            <Text style={s.resumoLabel}>Carbos hoje</Text>
          </View>
        </View>
      </View>

      {/* O que vamos fazer? */}
      <Text style={s.actionsTitle}>O que vamos fazer?</Text>
      <View style={s.grid}>
        {actions.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.actionCard}
            onPress={() => item.screen && (navigation as any).navigate(item.screen)}>
            <MaterialCommunityIcons
              name={item.icon}
              size={32}
              color={(colors as any)[item.colorKey]}
            />
            <Text style={s.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
    greeting: { fontSize: 20, fontWeight: '700', color: colors.white },
    subGreeting: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.background, fontWeight: '700', fontSize: 16 },
    alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14, marginBottom: 12 },
    alertText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardLabel: { color: colors.textMuted, fontSize: 13 },
    glicemiaValue: { color: colors.green, fontSize: 18, fontWeight: '700' },
    chart: { flexDirection: 'row', height: 60, alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 8 },
    chartCol: { flex: 1, alignItems: 'center' },
    chartDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
    chartLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 4 },
    chartLabel: { color: colors.textMuted, fontSize: 11, flex: 1, textAlign: 'center' },
    emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
    sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '600', marginBottom: 12 },
    resumoRow: { flexDirection: 'row', gap: 32 },
    resumoItem: { alignItems: 'flex-start', gap: 4 },
    resumoValue: { color: colors.white, fontSize: 28, fontWeight: '700' },
    resumoLabel: { color: colors.textMuted, fontSize: 12 },
    actionsTitle: { color: colors.white, fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { backgroundColor: colors.card, borderRadius: 16, width: '47%', paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', gap: 10 },
    actionLabel: { color: colors.white, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  });
}
