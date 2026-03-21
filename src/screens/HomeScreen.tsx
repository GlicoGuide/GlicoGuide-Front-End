import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/HomeStack';
import colors from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
};

const actions = [
  { label: 'Análise de\nPrato', icon: '📷', color: colors.green, screen: 'AnaliseDePrato' },
  { label: 'Relatório\nMensal', icon: '📋', color: colors.purple, screen: 'RelatorioMensal' },
  { label: 'Lembretes', icon: '🔔', color: colors.orange, screen: 'Lembretes' },
  { label: 'Chat Amigo', icon: '💬', color: colors.pink, screen: 'Chat' },
  { label: 'Minhas\nMetas', icon: '🎯', color: colors.yellow, screen: 'MinhasMetas' },
  { label: 'Loja Glico', icon: '🎁', color: colors.red, screen: 'LojaGlico' },
  { label: 'Diário', icon: '📖', color: colors.blue, screen: null },
  { label: 'Contar\nCarbo', icon: '🍽️', color: colors.cyan, screen: null },
];

// Pontos da linha do gráfico (mock)
const chartPoints = [80, 95, 119, 100, 115, 108, 119];
const days = ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Leticia! 👋</Text>
          <Text style={styles.subGreeting}>Vamos cuidar da saúde hoje?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
      </View>

      {/* Card Glicemia */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Média de Glicemia</Text>
          <Text style={styles.glicemiaValue}>119 mg/dL</Text>
        </View>
        {/* Gráfico simples */}
        <View style={styles.chart}>
          {chartPoints.map((val, i) => (
            <View key={i} style={styles.chartCol}>
              <View
                style={[
                  styles.chartDot,
                  { marginTop: ((130 - val) / 130) * 48 },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.chartLabels}>
          {days.map(d => (
            <Text key={d} style={styles.chartLabel}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Resumo do Dia */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumo do Dia</Text>
        <View style={styles.resumoRow}>
          <View>
            <Text style={styles.resumoValue}>125</Text>
            <Text style={styles.resumoLabel}>Glicemia</Text>
          </View>
          <View>
            <Text style={styles.resumoValue}>45g</Text>
            <Text style={styles.resumoLabel}>Carbos</Text>
          </View>
        </View>
      </View>

      {/* Progresso das Metas */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progresso das Metas</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Medir Glicemia em Jejum</Text>
          <Text style={styles.metaStatus}>1/1 Concluído</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%', backgroundColor: colors.green }]} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Beber 2L de água</Text>
          <Text style={styles.metaStatus}>1350/2000 ml</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '67%', backgroundColor: colors.blue }]} />
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
            <Text style={[styles.actionIcon, { color: item.color }]}>{item.icon}</Text>
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    color: colors.white,
    fontSize: 13,
  },
  metaStatus: {
    color: colors.textMuted,
    fontSize: 11,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
