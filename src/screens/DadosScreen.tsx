import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { getGlicemia, registrarGlicemia, GlicemiaRecord } from '../services/api';
import colors from '../theme/colors';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function statusGlicemia(valor: number) {
  if (valor < 70) return { label: 'Baixa', color: colors.red };
  if (valor <= 140) return { label: 'Normal', color: colors.green };
  if (valor <= 180) return { label: 'Alta', color: colors.yellow };
  return { label: 'Muito alta', color: colors.red };
}

export default function DadosScreen() {
  const [registros, setRegistros] = useState<GlicemiaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getGlicemia();
      setRegistros(data.slice().reverse());
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRegistrar() {
    const v = parseInt(valor, 10);
    if (!valor || isNaN(v) || v < 20 || v > 600) {
      Alert.alert('Valor inválido', 'Informe um valor entre 20 e 600 mg/dL.');
      return;
    }
    setSalvando(true);
    try {
      await registrarGlicemia(v);
      setValor('');
      await load();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  const media = registros.length > 0
    ? Math.round(registros.reduce((s, r) => s + r.valor_mgdl, 0) / registros.length)
    : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />
      }>
      <Text style={styles.title}>Glicemia</Text>

      {/* Registrar */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registrar medição</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            placeholder="mg/dL"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.btn, salvando && { opacity: 0.6 }]}
            onPress={handleRegistrar}
            disabled={salvando}>
            {salvando
              ? <ActivityIndicator color={colors.background} />
              : <Text style={styles.btnText}>Salvar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Média */}
      {media !== null && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Média geral</Text>
          <Text style={styles.mediaValue}>{media} <Text style={styles.mediaUnit}>mg/dL</Text></Text>
          <Text style={[styles.mediaStatus, { color: statusGlicemia(media).color }]}>
            {statusGlicemia(media).label}
          </Text>
        </View>
      )}

      {/* Histórico */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Histórico</Text>
        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
        ) : registros.length === 0 ? (
          <Text style={styles.empty}>Nenhum registro ainda.</Text>
        ) : (
          registros.map(r => {
            const st = statusGlicemia(r.valor_mgdl);
            return (
              <View key={r.id} style={styles.item}>
                <View>
                  <Text style={styles.itemValor}>{r.valor_mgdl} mg/dL</Text>
                  <Text style={styles.itemData}>{formatDate(r.created_at)}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: st.color + '33' }]}>
                  <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
            );
          })
        )}
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
  title: {
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
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 16,
  },
  btn: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 15,
  },
  mediaValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  mediaUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
  },
  mediaStatus: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemValor: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  itemData: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
