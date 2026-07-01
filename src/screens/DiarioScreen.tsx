import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { getEntradas, saveEntrada, deleteEntrada, EntradaDiario } from '../services/storage';
import { SafeAreaView } from 'react-native-safe-area-context';


const HUMORES: { key: EntradaDiario['humor']; icon: string; label: string; color: string }[] = [
  { key: 'otimo', icon: 'emoticon-excited-outline', label: 'Ótimo', color: '#39FF7E' },
  { key: 'bom', icon: 'emoticon-happy-outline', label: 'Bom', color: '#4A90E2' },
  { key: 'neutro', icon: 'emoticon-neutral-outline', label: 'Neutro', color: '#FFD166' },
  { key: 'ruim', icon: 'emoticon-sad-outline', label: 'Ruim', color: '#FF8C42' },
  { key: 'pessimo', icon: 'emoticon-cry-outline', label: 'Péssimo', color: '#FF4444' },
];

function formatData(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function DiarioScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<EntradaDiario | null>(null);
  const [texto, setTexto] = useState('');
  const [humor, setHumor] = useState<EntradaDiario['humor']>('bom');
  const [salvando, setSalvando] = useState(false);

  const load = useCallback(async () => {
    const data = await getEntradas();
    setEntradas(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function abrirNova() {
    setEditando(null);
    setTexto('');
    setHumor('bom');
    setModalVisible(true);
  }

  function abrirEdicao(entrada: EntradaDiario) {
    setEditando(entrada);
    setTexto(entrada.texto);
    setHumor(entrada.humor);
    setModalVisible(true);
  }

  async function handleSalvar() {
    if (!texto.trim()) {
      Alert.alert('Atenção', 'Escreva algo no diário.');
      return;
    }
    setSalvando(true);
    const entrada: EntradaDiario = {
      id: editando?.id || Date.now().toString(),
      data: editando?.data || new Date().toISOString(),
      texto: texto.trim(),
      humor,
    };
    await saveEntrada(entrada);
    await load();
    setSalvando(false);
    setModalVisible(false);
  }

  async function handleDeletar(id: string) {
    Alert.alert('Remover', 'Deseja remover esta entrada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          await deleteEntrada(id);
          await load();
        },
      },
    ]);
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={s.flex}>
      <ScrollView style={s.container}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
            <Text style={s.backText}>Diário</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={abrirNova}>
            <MaterialCommunityIcons name="plus-circle" size={28} color={colors.green} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
        ) : entradas.length === 0 ? (
          <View style={s.emptyBox}>
            <MaterialCommunityIcons name="book-open-outline" size={56} color={colors.textMuted} />
            <Text style={s.emptyText}>Seu diário está vazio.</Text>
            <Text style={s.emptySubText}>Registre como você está se sentindo hoje!</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={abrirNova}>
              <MaterialCommunityIcons name="pencil-plus-outline" size={18} color={colors.background} />
              <Text style={s.emptyBtnText}>Primeira entrada</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entradas.map(entrada => {
            const humInfo = HUMORES.find(h => h.key === entrada.humor) || HUMORES[1];
            return (
              <TouchableOpacity key={entrada.id} style={s.card} onPress={() => abrirEdicao(entrada)} onLongPress={() => handleDeletar(entrada.id)} activeOpacity={0.8}>
                <View style={s.cardHeader}>
                  <View style={[s.humorBadge, { backgroundColor: humInfo.color + '22' }]}>
                    <MaterialCommunityIcons name={humInfo.icon} size={20} color={humInfo.color} />
                    <Text style={[s.humorLabel, { color: humInfo.color }]}>{humInfo.label}</Text>
                  </View>
                  <Text style={s.cardData}>{formatData(entrada.data)}</Text>
                </View>
                <Text style={s.cardTexto} numberOfLines={4}>{entrada.texto}</Text>
                <Text style={s.cardHint}>Toque para editar · segure para remover</Text>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editando ? 'Editar entrada' : 'Nova entrada'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>Como você está se sentindo?</Text>
            <View style={s.humoresRow}>
              {HUMORES.map(h => (
                <TouchableOpacity
                  key={h.key}
                  style={[s.humorOption, humor === h.key && { borderColor: h.color, backgroundColor: h.color + '22' }]}
                  onPress={() => setHumor(h.key)}>
                  <MaterialCommunityIcons name={h.icon} size={26} color={humor === h.key ? h.color : colors.textMuted} />
                  <Text style={[s.humorOptionLabel, { color: humor === h.key ? h.color : colors.textMuted }]}>{h.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.modalLabel}>Escreva</Text>
            <TextInput
              style={s.textArea}
              placeholder="Como foi seu dia? Registre seus sentimentos, alimentação, sintomas..."
              placeholderTextColor={colors.textMuted}
              value={texto}
              onChangeText={setTexto}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity style={[s.modalBtn, salvando && { opacity: 0.7 }]} onPress={handleSalvar} disabled={salvando}>
              {salvando
                ? <ActivityIndicator color={colors.background} />
                : <>
                  <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.background} />
                  <Text style={s.modalBtnText}>Salvar</Text>
                </>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backText: { color: colors.white, fontSize: 17, fontWeight: '600' },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    emptySubText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 30, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
    emptyBtnText: { color: colors.background, fontSize: 15, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    humorBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    humorLabel: { fontSize: 12, fontWeight: '600' },
    cardData: { color: colors.textMuted, fontSize: 11 },
    cardTexto: { color: colors.white, fontSize: 14, lineHeight: 22 },
    cardHint: { color: colors.textMuted, fontSize: 11, marginTop: 10 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    modalTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    modalLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    humoresRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
    humorOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, gap: 4 },
    humorOptionLabel: { fontSize: 10, fontWeight: '600' },
    textArea: { backgroundColor: colors.background, borderRadius: 12, padding: 14, color: colors.white, fontSize: 14, lineHeight: 22, minHeight: 120 },
    modalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 30, height: 50 },
    modalBtnText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  });
}
