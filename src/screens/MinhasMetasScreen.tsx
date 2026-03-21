import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const metas = [
  { id: 1, nome: 'Medir Glicemia em Jejum', freq: 'Todos os dias', progresso: 1, total: 1, unidade: '', concluida: true },
  { id: 2, nome: 'Comer 2 frutas', freq: 'Diário', progresso: 1, total: 2, unidade: '', concluida: false },
  { id: 3, nome: 'Beber 2L de água', freq: 'Diário', progresso: 1500, total: 2000, unidade: ' ml', concluida: false },
  { id: 4, nome: 'Atividade Física', freq: '30 min', progresso: 0, total: 1, unidade: '', concluida: false },
];

export default function MinhasMetasScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Minhas Metas</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Acompanhe seu progresso!</Text>

      {metas.map(meta => {
        const pct = meta.total > 0 ? meta.progresso / meta.total : 0;
        return (
          <View key={meta.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.metaNome}>{meta.nome}</Text>
              {meta.concluida ? (
                <Text style={styles.checkIcon}>✅</Text>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </View>
            <Text style={styles.freq}>{meta.freq}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(pct * 100, 100)}%`,
                    backgroundColor: meta.concluida ? colors.green : colors.blue,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {meta.progresso}/{meta.total}{meta.unidade}
            </Text>
          </View>
        );
      })}
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
    marginBottom: 4,
  },
  backText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 16,
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
    marginBottom: 4,
  },
  metaNome: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkIcon: {
    fontSize: 18,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  freq: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },
});
