import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const recompensas = [
  { id: 1, nome: 'Mudar Avatar', desc: 'Desbloqueie novos avatares divertidos...', pontos: 500, desbloqueada: false },
  { id: 2, nome: 'Mudar Cor do App', desc: 'Personalize o tema do GlicoGuide.', pontos: 1000, desbloqueada: false },
  { id: 3, nome: 'Brinde no Consultório', desc: 'Resgate um brinde na sua próxima consulta.', pontos: 0, desbloqueada: false },
];

export default function LojaGlicoScreen({ navigation }: any) {
  const pontos = 350;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Loja de Pontos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🎮 {pontos} GP</Text>
        </View>
      </View>

      {/* Banner tempo poupado */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>⏱ Tempo Poupado</Text>
        <Text style={styles.bannerDesc}>
          Graças à câmera inteligente, você já poupou 4 horas de digitação este mês!
        </Text>
        <Text style={styles.bannerNote}>Isso equivale a 2 filmes! 🎬🍿</Text>
      </View>

      <Text style={styles.sectionTitle}>Recompensas Disponíveis</Text>

      {recompensas.map(r => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.cardIcon}>🎁</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNome}>{r.nome}</Text>
            <Text style={styles.cardDesc}>{r.desc}</Text>
            <Text style={styles.cardPontos}>{r.pontos} GlicoPoints</Text>
          </View>
          <View style={styles.bloqueadoBadge}>
            <Text style={styles.bloqueadoText}>Bloqueado</Text>
          </View>
        </View>
      ))}
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
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  backText: {
    color: colors.white,
    fontSize: 22,
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.cardAlt,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '700',
  },
  banner: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerDesc: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 20,
  },
  bannerNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardPontos: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '600',
  },
  bloqueadoBadge: {
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bloqueadoText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
