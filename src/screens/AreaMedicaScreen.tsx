import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGlicemia, getMeals, GlicemiaRecord, Meal } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function calcStats(registros: GlicemiaRecord[]) {
  if (registros.length === 0) return null;
  const media = Math.round(registros.reduce((s, r) => s + r.valor_mgdl, 0) / registros.length);
  const noAlvo = registros.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length;
  const tempoNoAlvo = Math.round((noAlvo / registros.length) * 100);
  const hipo = registros.filter(r => r.valor_mgdl < 70).length;
  return { media, tempoNoAlvo, hipo };
}

export default function AreaMedicaScreen() {
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
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = calcStats(glicemia);
  const totalCarbs = meals.reduce((s, m) => s + m.total_carboidratos_g, 0);
  const mediaCarbs = meals.length > 0 ? Math.round(totalCarbs / meals.length) : null;

  const faixas = [
    { label: 'Hipoglicemia (< 70)', count: glicemia.filter(r => r.valor_mgdl < 70).length, color: colors.red, icon: 'arrow-down-circle-outline' },
    { label: 'Normal (70–180)', count: glicemia.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length, color: colors.green, icon: 'check-circle-outline' },
    { label: 'Alta (> 180)', count: glicemia.filter(r => r.valor_mgdl > 180).length, color: colors.yellow, icon: 'arrow-up-circle-outline' },
  ];

  const s = makeStyles(colors);

  return (
    <ScrollView
      style={s.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />
      }>
      <Text style={s.pageTitle}>Área Médica</Text>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <MaterialCommunityIcons name="water-outline" size={20} color={colors.blue} />
              <Text style={s.cardTitle}>Glicemia</Text>
            </View>
            <Text style={s.cardSub}>Baseado em {glicemia.length} medição{glicemia.length !== 1 ? 'ões' : ''}</Text>

            {stats ? (
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.green }]}>{stats.tempoNoAlvo}%</Text>
                  <Text style={s.statLabel}>Tempo no{'\n'}Alvo</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{stats.media}</Text>
                  <Text style={s.statLabel}>Média{'\n'}mg/dL</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: stats.hipo > 0 ? colors.red : colors.green }]}>
                    {stats.hipo}
                  </Text>
                  <Text style={s.statLabel}>Hipoglicemias</Text>
                </View>
              </View>
            ) : (
              <View style={s.emptyBox}>
                <MaterialCommunityIcons name="chart-line" size={32} color={colors.textMuted} />
                <Text style={s.empty}>Nenhuma medição de glicemia ainda.</Text>
              </View>
            )}
          </View>

          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <MaterialCommunityIcons name="food-fork-drink" size={20} color={colors.orange} />
              <Text style={s.cardTitle}>Refeições</Text>
            </View>
            <Text style={s.cardSub}>Baseado em {meals.length} refeição{meals.length !== 1 ? 'ões' : ''} analisada{meals.length !== 1 ? 's' : ''}</Text>

            {meals.length > 0 ? (
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{meals.length}</Text>
                  <Text style={s.statLabel}>Refeições{'\n'}registradas</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{mediaCarbs}g</Text>
                  <Text style={s.statLabel}>Média de{'\n'}carboidratos</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{totalCarbs}g</Text>
                  <Text style={s.statLabel}>Total de{'\n'}carboidratos</Text>
                </View>
              </View>
            ) : (
              <View style={s.emptyBox}>
                <MaterialCommunityIcons name="food-off" size={32} color={colors.textMuted} />
                <Text style={s.empty}>Nenhuma refeição analisada ainda.</Text>
              </View>
            )}
          </View>

          {stats && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="chart-pie" size={20} color={colors.purple} />
                <Text style={s.cardTitle}>Distribuição das medições</Text>
              </View>
              <Text style={s.cardSub}>Classificação por faixa de glicemia</Text>
              {faixas.map((item, i) => (
                <View key={i} style={[s.faixaRow, i < faixas.length - 1 && s.faixaBorder]}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  <Text style={s.faixaLabel}>{item.label}</Text>
                  <Text style={[s.faixaCount, { color: item.color }]}>{item.count}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    pageTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 16 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    cardTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
    cardSub: { color: colors.textMuted, fontSize: 12, marginBottom: 16 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    stat: { alignItems: 'center' },
    statValue: { color: colors.white, fontSize: 28, fontWeight: '700' },
    statLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
    emptyBox: { alignItems: 'center', paddingVertical: 12, gap: 8 },
    empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    faixaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    faixaBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    faixaLabel: { color: colors.white, fontSize: 13, flex: 1 },
    faixaCount: { fontSize: 15, fontWeight: '700' },
  });
}
