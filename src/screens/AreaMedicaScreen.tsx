import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getGlicemia, getMeals, GlicemiaRecord, Meal } from '../services/api';
import colors from '../theme/colors';

function calcStats(registros: GlicemiaRecord[]) {
  if (registros.length === 0) return null;
  const media = Math.round(registros.reduce((s, r) => s + r.valor_mgdl, 0) / registros.length);
  const noAlvo = registros.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length;
  const tempoNoAlvo = Math.round((noAlvo / registros.length) * 100);
  const hipo = registros.filter(r => r.valor_mgdl < 70).length;
  return { media, tempoNoAlvo, hipo };
}

export default function AreaMedicaScreen() {
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
      <Text style={styles.pageTitle}>Área Médica</Text>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Stats glicemia */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Glicemia</Text>
            <Text style={styles.cardSub}>Baseado em {glicemia.length} medição{glicemia.length !== 1 ? 'ões' : ''}</Text>

            {stats ? (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.green }]}>{stats.tempoNoAlvo}%</Text>
                  <Text style={styles.statLabel}>Tempo no{'\n'}Alvo</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.media}</Text>
                  <Text style={styles.statLabel}>Média{'\n'}mg/dL</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: stats.hipo > 0 ? colors.red : colors.green }]}>
                    {stats.hipo}
                  </Text>
                  <Text style={styles.statLabel}>Hipoglicemias</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.empty}>Nenhuma medição de glicemia ainda.</Text>
            )}
          </View>

          {/* Stats refeições */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Refeições</Text>
            <Text style={styles.cardSub}>Baseado em {meals.length} refeição{meals.length !== 1 ? 'ões' : ''} analisada{meals.length !== 1 ? 's' : ''}</Text>

            {meals.length > 0 ? (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{meals.length}</Text>
                  <Text style={styles.statLabel}>Refeições{'\n'}registradas</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{mediaCarbs}g</Text>
                  <Text style={styles.statLabel}>Média de{'\n'}carboidratos</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{totalCarbs}g</Text>
                  <Text style={styles.statLabel}>Total de{'\n'}carboidratos</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.empty}>Nenhuma refeição analisada ainda.</Text>
            )}
          </View>

          {/* Zona alvo */}
          {stats && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Distribuição das medições</Text>
              <Text style={styles.cardSub}>Classificação por faixa de glicemia</Text>
              {[
                { label: 'Hipoglicemia (< 70)', count: glicemia.filter(r => r.valor_mgdl < 70).length, color: colors.red },
                { label: 'Normal (70–180)', count: glicemia.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length, color: colors.green },
                { label: 'Alta (> 180)', count: glicemia.filter(r => r.valor_mgdl > 180).length, color: colors.yellow },
              ].map((item, i) => (
                <View key={i} style={styles.faixaRow}>
                  <View style={[styles.faixaDot, { backgroundColor: item.color }]} />
                  <Text style={styles.faixaLabel}>{item.label}</Text>
                  <Text style={[styles.faixaCount, { color: item.color }]}>{item.count}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  pageTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  faixaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  faixaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  faixaLabel: {
    color: colors.white,
    fontSize: 13,
    flex: 1,
  },
  faixaCount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
