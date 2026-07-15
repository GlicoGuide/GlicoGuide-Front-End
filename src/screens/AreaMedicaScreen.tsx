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
import { getResumoMedico, ResumoMedico } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AreaMedicaScreen() {
  const { colors } = useTheme();
  const [resumo, setResumo] = useState<ResumoMedico | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getResumoMedico();
      setResumo(data);
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const glicemia = resumo?.glicemia;
  const refeicoes = resumo?.refeicoes;

  const faixas = glicemia ? [
    { label: 'Hipoglicemia (< 70)', count: glicemia.faixas.hipoglicemia, color: colors.red, icon: 'arrow-down-circle-outline' },
    { label: 'Normal (70–180)', count: glicemia.faixas.normal, color: colors.green, icon: 'check-circle-outline' },
    { label: 'Alta (> 180)', count: glicemia.faixas.alta, color: colors.yellow, icon: 'arrow-up-circle-outline' },
  ] : [];

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
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
            <Text style={s.cardSub}>
              Baseado em {glicemia?.total_medicoes ?? 0} medição{glicemia?.total_medicoes !== 1 ? 'ões' : ''}
            </Text>

            {glicemia && glicemia.total_medicoes > 0 ? (
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.green }]}>{glicemia.tempo_no_alvo_pct}%</Text>
                  <Text style={s.statLabel}>Tempo no{'\n'}Alvo</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{glicemia.media_mgdl}</Text>
                  <Text style={s.statLabel}>Média{'\n'}mg/dL</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.purple }]}>{glicemia.hba1c_estimada_pct}%</Text>
                  <Text style={s.statLabel}>HbA1c{'\n'}estimada</Text>
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
            <Text style={s.cardSub}>
              Baseado em {refeicoes?.total ?? 0} refeição{refeicoes?.total !== 1 ? 'ões' : ''} analisada{refeicoes?.total !== 1 ? 's' : ''}
            </Text>

            {refeicoes && refeicoes.total > 0 ? (
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{refeicoes.total}</Text>
                  <Text style={s.statLabel}>Refeições{'\n'}registradas</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{refeicoes.media_carboidratos_g}g</Text>
                  <Text style={s.statLabel}>Média de{'\n'}carboidratos</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{refeicoes.total_carboidratos_g}g</Text>
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

          {glicemia && glicemia.total_medicoes > 0 && (
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
    </SafeAreaView>
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
