import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGlicemia, getMeals, GlicemiaRecord, Meal } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function calcRelatorio(glicemia: GlicemiaRecord[], meals: Meal[], ano: number, mes: number) {
  const inMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getFullYear() === ano && d.getMonth() === mes;
  };

  const glicMes = glicemia.filter(r => inMonth(r.created_at));
  const mealsMes = meals.filter(m => inMonth(m.created_at));

  const mediaGlic = glicMes.length > 0
    ? Math.round(glicMes.reduce((s, r) => s + r.valor_mgdl, 0) / glicMes.length)
    : null;

  const noAlvo = glicMes.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length;
  const tempoAlvo = glicMes.length > 0 ? Math.round((noAlvo / glicMes.length) * 100) : null;

  const hipos = glicMes.filter(r => r.valor_mgdl < 70).length;
  const hiper = glicMes.filter(r => r.valor_mgdl > 180).length;

  // Contagem de componentes de refeições
  const componenteCounts: Record<string, number> = {};
  mealsMes.forEach(m => {
    m.componentes?.forEach(c => {
      componenteCounts[c.nome] = (componenteCounts[c.nome] || 0) + 1;
    });
  });
  const topAlimentos = Object.entries(componenteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const mediaCarbs = mealsMes.length > 0
    ? Math.round(mealsMes.reduce((s, m) => s + m.total_carboidratos_g, 0) / mealsMes.length)
    : null;

  const refeicoesMaisCarbo = [...mealsMes]
    .sort((a, b) => b.total_carboidratos_g - a.total_carboidratos_g)
    .slice(0, 3);

  return { glicMes, mealsMes, mediaGlic, tempoAlvo, hipos, hiper, topAlimentos, mediaCarbs, refeicoesMaisCarbo };
}

export default function RelatorioMensalScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [glicemia, setGlicemia] = useState<GlicemiaRecord[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth());

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

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAno(a => a - 1); }
    else setMes(m => m - 1);
  }
  function proximoMes() {
    const next = new Date(ano, mes + 1, 1);
    if (next > now) return;
    if (mes === 11) { setMes(0); setAno(a => a + 1); }
    else setMes(m => m + 1);
  }

  const rel = calcRelatorio(glicemia, meals, ano, mes);
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
        <Text style={s.backText}>Relatório Mensal</Text>
      </TouchableOpacity>

      {/* Seletor de mês */}
      <View style={s.monthSelector}>
        <TouchableOpacity onPress={mesAnterior} style={s.monthArrow}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.monthLabel}>{MESES[mes]} {ano}</Text>
        <TouchableOpacity onPress={proximoMes} style={s.monthArrow}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={new Date(ano, mes + 1, 1) > now ? colors.border : colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
      ) : rel.glicMes.length === 0 && rel.mealsMes.length === 0 ? (
        <View style={s.emptyBox}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={colors.textMuted} />
          <Text style={s.emptyText}>Sem dados para {MESES[mes]}.</Text>
          <Text style={s.emptySubText}>Registre medições e refeições para ver o relatório.</Text>
        </View>
      ) : (
        <>
          {/* Glicemia */}
          {rel.glicMes.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="water-outline" size={18} color={colors.blue} />
                <Text style={s.cardTitle}>Glicemia</Text>
                <Text style={s.cardCount}>{rel.glicMes.length} medições</Text>
              </View>
              <View style={s.statsRow}>
                <StatBox label="Média" value={`${rel.mediaGlic}`} unit="mg/dL" color={colors.white} colors={colors} />
                <StatBox label="No Alvo" value={`${rel.tempoAlvo}%`} unit="" color={colors.green} colors={colors} />
                <StatBox label="Hipos" value={`${rel.hipos}`} unit="vezes" color={rel.hipos > 0 ? colors.red : colors.green} colors={colors} />
                <StatBox label="Altas" value={`${rel.hiper}`} unit="vezes" color={rel.hiper > 0 ? colors.yellow : colors.green} colors={colors} />
              </View>
            </View>
          )}

          {/* Refeições */}
          {rel.mealsMes.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="food-fork-drink" size={18} color={colors.orange} />
                <Text style={s.cardTitle}>Refeições</Text>
                <Text style={s.cardCount}>{rel.mealsMes.length} refeições</Text>
              </View>
              <View style={s.statsRow}>
                <StatBox label="Média Carbo" value={`${rel.mediaCarbs}g`} unit="" color={colors.white} colors={colors} />
                <StatBox label="Total Carbo" value={`${rel.mealsMes.reduce((s, m) => s + m.total_carboidratos_g, 0)}g`} unit="" color={colors.white} colors={colors} />
              </View>
            </View>
          )}

          {/* Top alimentos */}
          {rel.topAlimentos.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="trending-up" size={18} color={colors.green} />
                <Text style={s.cardTitle}>Alimentos mais consumidos</Text>
              </View>
              {rel.topAlimentos.map(([nome, count], i) => (
                <View key={nome} style={[s.rankRow, i < rel.topAlimentos.length - 1 && s.rankBorder]}>
                  <Text style={s.rankNum}>{i + 1}</Text>
                  <Text style={s.rankNome}>{nome}</Text>
                  <Text style={s.rankCount}>{count}x</Text>
                </View>
              ))}
            </View>
          )}

          {/* Maiores refeições */}
          {rel.refeicoesMaisCarbo.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="alert-outline" size={18} color={colors.yellow} />
                <Text style={s.cardTitle}>Refeições com mais carbo</Text>
              </View>
              {rel.refeicoesMaisCarbo.map((m, i) => (
                <View key={m.id} style={[s.rankRow, i < rel.refeicoesMaisCarbo.length - 1 && s.rankBorder]}>
                  <MaterialCommunityIcons name="food-variant" size={16} color={colors.textMuted} />
                  <Text style={s.rankNome} numberOfLines={1}>{m.observation || `Refeição ${i + 1}`}</Text>
                  <Text style={[s.rankCount, { color: colors.yellow }]}>{m.total_carboidratos_g}g</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, unit, color, colors }: any) {
  const s = makeStyles(colors);
  return (
    <View style={s.statBox}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      {unit ? <Text style={s.statUnit}>{unit}</Text> : null}
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 16 },
    backText: { color: colors.white, fontSize: 17, fontWeight: '600' },
    monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16, backgroundColor: colors.card, borderRadius: 14, paddingVertical: 10 },
    monthArrow: { padding: 4 },
    monthLabel: { color: colors.white, fontSize: 16, fontWeight: '700', minWidth: 160, textAlign: 'center' },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    emptySubText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    cardTitle: { color: colors.white, fontSize: 15, fontWeight: '700', flex: 1 },
    cardCount: { color: colors.textMuted, fontSize: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statBox: { alignItems: 'center', gap: 2 },
    statValue: { fontSize: 22, fontWeight: '700' },
    statUnit: { color: colors.textMuted, fontSize: 10 },
    statLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
    rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    rankBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rankNum: { color: colors.green, fontSize: 14, fontWeight: '700', width: 20 },
    rankNome: { color: colors.white, fontSize: 14, flex: 1 },
    rankCount: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  });
}
