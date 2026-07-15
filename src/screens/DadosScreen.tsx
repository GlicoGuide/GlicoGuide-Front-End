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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGlicemia, registrarGlicemia, GlicemiaRecord } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { alertaVisual, classificarNivel, precisaAtencao } from '../utils/alerta';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function DadosScreen() {
  const { colors } = useTheme();
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

  const ultimoRegistro = registros[registros.length - 1];
  const mediaVisual = media !== null ? alertaVisual(classificarNivel(media), colors) : null;

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
      style={s.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />
      }>
      <Text style={s.title}>Glicemia</Text>

      {/* Alerta da última medição */}
      {ultimoRegistro && precisaAtencao(ultimoRegistro.alerta.nivel) && (
        <View style={[s.alertBanner, { backgroundColor: alertaVisual(ultimoRegistro.alerta.nivel, colors).color + '22' }]}>
          <MaterialCommunityIcons
            name={alertaVisual(ultimoRegistro.alerta.nivel, colors).icon}
            size={22}
            color={alertaVisual(ultimoRegistro.alerta.nivel, colors).color}
          />
          <Text style={[s.alertText, { color: alertaVisual(ultimoRegistro.alerta.nivel, colors).color }]}>
            {ultimoRegistro.alerta.mensagem}
          </Text>
        </View>
      )}

      {/* Registrar */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Registrar medição</Text>
        <View style={s.row}>
          <View style={s.inputWrapper}>
            <MaterialCommunityIcons name="water-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={s.input}
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
              placeholder="mg/dL"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[s.btn, salvando && { opacity: 0.6 }]}
            onPress={handleRegistrar}
            disabled={salvando}>
            {salvando
              ? <ActivityIndicator color={colors.background} />
              : <Text style={s.btnText}>Salvar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Média */}
      {media !== null && mediaVisual && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Média geral</Text>
          <View style={s.mediaRow}>
            <Text style={s.mediaValue}>{media} <Text style={s.mediaUnit}>mg/dL</Text></Text>
            <View style={[s.badge, { backgroundColor: mediaVisual.color + '33' }]}>
              <MaterialCommunityIcons name={mediaVisual.icon} size={14} color={mediaVisual.color} />
              <Text style={[s.badgeText, { color: mediaVisual.color }]}>
                {mediaVisual.label}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Histórico */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Histórico</Text>
        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
        ) : registros.length === 0 ? (
          <View style={s.emptyBox}>
            <MaterialCommunityIcons name="chart-line" size={32} color={colors.textMuted} />
            <Text style={s.empty}>Nenhum registro ainda.</Text>
          </View>
        ) : (
          registros.map(r => {
            const visual = alertaVisual(r.alerta.nivel, colors);
            return (
              <View key={r.id} style={s.item}>
                <MaterialCommunityIcons name="water-outline" size={20} color={visual.color} />
                <View style={s.itemInfo}>
                  <Text style={s.itemValor}>{r.valor_mgdl} mg/dL</Text>
                  <Text style={s.itemData}>{formatDate(r.created_at)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: visual.color + '33' }]}>
                  <Text style={[s.badgeText, { color: visual.color }]}>{visual.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 16 },
    alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14, marginBottom: 12 },
    alertText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    sectionTitle: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    row: { flexDirection: 'row', gap: 10 },
    inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
    input: { flex: 1, height: 48, color: colors.white, fontSize: 16 },
    btn: { backgroundColor: colors.green, borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: colors.background, fontWeight: '700', fontSize: 15 },
    mediaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    mediaValue: { color: colors.white, fontSize: 36, fontWeight: '700' },
    mediaUnit: { fontSize: 16, fontWeight: '400', color: colors.textMuted },
    emptyBox: { alignItems: 'center', paddingVertical: 16, gap: 8 },
    empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    itemInfo: { flex: 1 },
    itemValor: { color: colors.white, fontSize: 15, fontWeight: '600' },
    itemData: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText: { fontSize: 12, fontWeight: '600' },
  });
}
