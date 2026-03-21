import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function RelatorioMensalScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Relatório Mensal</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Relatório Mensal</Text>
        <Text style={styles.cardDate}>Dezembro 2025</Text>

        <View style={[styles.section, { borderLeftColor: colors.green }]}>
          <Text style={[styles.sectionTitle, { color: colors.green }]}>
            📈 O que você mais comeu
          </Text>
          <Text style={styles.item}>1. Ovos Mexidos (28x)</Text>
          <Text style={styles.item}>2. Salada de Folhas (20x)</Text>
          <Text style={styles.item}>3. Arroz Integral (15x)</Text>
        </View>

        <View style={[styles.section, { borderLeftColor: colors.yellow }]}>
          <Text style={[styles.sectionTitle, { color: colors.yellow }]}>
            ⚠️ Maiores Deslizes
          </Text>
          <Text style={styles.item}>• Esquecer a insulina na janta (3x)</Text>
          <Text style={styles.item}>• Excesso de carboidratos no café da tarde</Text>
        </View>

        <View style={[styles.section, { borderLeftColor: colors.cyan }]}>
          <Text style={[styles.sectionTitle, { color: colors.cyan }]}>
            💡 O que pode melhorar
          </Text>
          <Text style={styles.item}>• Tente aumentar a ingestão de água pela manhã.</Text>
          <Text style={styles.item}>• Registre seus lanches noturnos com mais frequência.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  back: {
    marginTop: 16,
    marginBottom: 16,
  },
  backText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cardDate: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  section: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  item: {
    color: colors.white,
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 20,
  },
});
