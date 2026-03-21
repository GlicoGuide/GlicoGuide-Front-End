import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const acoes = [
  { icon: '📋', title: 'Personalizar Plano Alimentar', desc: 'Ajuste metas de calorias e macros' },
  { icon: '✏️', title: 'Editar Base de Dados', desc: 'Gerencie alimentos e informações nutricionais' },
  { icon: '⚙️', title: 'Configurar Metas Clínicas', desc: 'Defina alvos de glicemia e insulina' },
];

export default function AreaMedicaScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Área Médica</Text>

      {/* Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Área Médica</Text>
        <Text style={styles.cardSub}>Configurações do tratamento</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.green }]}>72%</Text>
            <Text style={styles.statLabel}>Tempo no{'\n'}Alvo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>134</Text>
            <Text style={styles.statLabel}>Glicemia{'\n'}Média</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.red }]}>2</Text>
            <Text style={styles.statLabel}>Hipoglicemias</Text>
          </View>
        </View>

        <View style={styles.obs}>
          <Text style={styles.obsText}>
            Observação: Paciente tem mantido boa consistência nas medições pré-prandiais. Notável redução no consumo de alimentos ultraprocessados.
          </Text>
        </View>

        <View style={styles.alert}>
          <Text style={styles.alertText}>
            <Text style={{ color: colors.yellow, fontWeight: '700' }}>Atenção: </Text>
            Picos de glicemia pós-almoço sugerem necessidade de ajuste na contagem de carboidratos ou revisão da dose de insulina rápida.
          </Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      {acoes.map((a, i) => (
        <TouchableOpacity key={i} style={styles.actionCard}>
          <Text style={styles.actionIcon}>{a.icon}</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDesc}>{a.desc}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
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
  pageTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  obs: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  obsText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 18,
  },
  alert: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.yellow,
  },
  alertText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  actionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
  },
});
