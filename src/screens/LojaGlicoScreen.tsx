import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPontos } from '../services/api';


const recompensas = [
  { id: 1, nome: 'Mudar Avatar', desc: 'Desbloqueie novos avatares divertidos...', pontos: 500, icon: 'account-edit-outline' },
  { id: 2, nome: 'Mudar Cor do App', desc: 'Personalize o tema do GlicoGuide.', pontos: 1000, icon: 'palette-outline' },
  { id: 3, nome: 'Brinde no Consultório', desc: 'Resgate um brinde na sua próxima consulta.', pontos: 2000, icon: 'medical-bag' },
];

export default function LojaGlicoScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getPontos();
      setPontos(data.total_pontos);
    } catch {
      // mantém saldo anterior
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={s.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />
        }>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.title}>Loja de Pontos</Text>
        <View style={s.badge}>
          <MaterialCommunityIcons name="gamepad-variant-outline" size={14} color={colors.green} />
          <Text style={s.badgeText}>{loading ? '…' : `${pontos} GP`}</Text>
        </View>
      </View>

      <View style={s.banner}>
        <View style={s.bannerIcon}>
          <MaterialCommunityIcons name="timer-outline" size={24} color={colors.cyan} />
        </View>
        <View style={s.bannerContent}>
          <Text style={s.bannerTitle}>Tempo Poupado</Text>
          <Text style={s.bannerDesc}>
            Graças à câmera inteligente, você já poupou 4 horas de digitação este mês!
          </Text>
          <View style={s.bannerNote}>
            <MaterialCommunityIcons name="movie-open-outline" size={14} color={colors.textMuted} />
            <Text style={s.bannerNoteText}>Isso equivale a 2 filmes!</Text>
          </View>
        </View>
      </View>

      <Text style={s.sectionTitle}>Recompensas Disponíveis</Text>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
      ) : (
        recompensas.map(r => {
          const desbloqueada = pontos >= r.pontos;
          return (
            <View key={r.id} style={[s.card, desbloqueada && s.cardDesbloqueada]}>
              <View style={s.cardIconBox}>
                <MaterialCommunityIcons name={r.icon} size={28} color={colors.yellow} />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardNome}>{r.nome}</Text>
                <Text style={s.cardDesc}>{r.desc}</Text>
                <View style={s.cardPontosRow}>
                  <MaterialCommunityIcons name="star-circle-outline" size={14} color={colors.yellow} />
                  <Text style={s.cardPontos}>{r.pontos} GlicoPoints</Text>
                </View>
              </View>
              <View style={[s.bloqueadoBadge, desbloqueada && { backgroundColor: colors.green + '22' }]}>
                <MaterialCommunityIcons
                  name={desbloqueada ? 'lock-open-variant-outline' : 'lock-outline'}
                  size={14}
                  color={desbloqueada ? colors.green : colors.textMuted}
                />
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 16, gap: 12 },
    backBtn: {},
    title: { color: colors.white, fontSize: 17, fontWeight: '700', flex: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    badgeText: { color: colors.green, fontSize: 13, fontWeight: '700' },
    banner: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 20, gap: 14 },
    bannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cyan + '22', alignItems: 'center', justifyContent: 'center' },
    bannerContent: { flex: 1 },
    bannerTitle: { color: colors.cyan, fontSize: 14, fontWeight: '700', marginBottom: 4 },
    bannerDesc: { color: colors.white, fontSize: 13, lineHeight: 18 },
    bannerNote: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    bannerNoteText: { color: colors.textMuted, fontSize: 12 },
    sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '600', marginBottom: 12 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    cardDesbloqueada: { borderWidth: 1, borderColor: colors.green + '55' },
    cardIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.yellow + '22', alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    cardNome: { color: colors.white, fontSize: 14, fontWeight: '600', marginBottom: 2 },
    cardDesc: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 4 },
    cardPontosRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardPontos: { color: colors.yellow, fontSize: 12, fontWeight: '600' },
    bloqueadoBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  });
}
