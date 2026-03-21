import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const initialLembretes = [
  { id: 1, nome: 'Lantus (Basal)', horario: '20:00', ativo: true, tipo: 'insulina' },
  { id: 2, nome: 'Medir Glicemia', horario: '07:00', ativo: true, tipo: 'glicemia' },
  { id: 3, nome: 'Novorapid (Almoço)', horario: '12:30', ativo: false, tipo: 'insulina' },
];

export default function LembretesScreen({ navigation }: any) {
  const [lembretes, setLembretes] = useState(initialLembretes);

  const toggle = (id: number) => {
    setLembretes(prev =>
      prev.map(l => (l.id === id ? { ...l, ativo: !l.ativo } : l)),
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Lembretes</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Lembretes & Alarmes</Text>
          <TouchableOpacity>
            <Text style={styles.addBtn}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🔔 Ative as notificações para não esquecer suas doses!
          </Text>
        </View>

        {/* Lista */}
        {lembretes.map(l => (
          <View key={l.id} style={styles.lembrete}>
            <Text style={styles.lembreteIcon}>
              {l.tipo === 'insulina' ? '💉' : '🩸'}
            </Text>
            <View style={styles.lembreteInfo}>
              <Text style={styles.lembreteNome}>{l.nome}</Text>
              <Text style={styles.lembreteHora}>⏰ {l.horario}</Text>
            </View>
            <Switch
              value={l.ativo}
              onValueChange={() => toggle(l.id)}
              trackColor={{ false: colors.border, true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        ))}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  addBtn: {
    color: colors.green,
    fontSize: 24,
    fontWeight: '300',
  },
  banner: {
    backgroundColor: colors.cyan,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '500',
  },
  lembrete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  lembreteIcon: {
    fontSize: 20,
  },
  lembreteInfo: {
    flex: 1,
  },
  lembreteNome: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  lembreteHora: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
