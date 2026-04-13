import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGlicemia, getMeals } from '../services/api';
import { getMetasCustom, saveMetasCustom, MetaCustom } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

const ICON_OPTIONS = [
  { icon: 'cup-water', label: 'Água' },
  { icon: 'run', label: 'Exercício' },
  { icon: 'bed-outline', label: 'Sono' },
  { icon: 'meditation', label: 'Meditação' },
  { icon: 'food-apple-outline', label: 'Dieta' },
  { icon: 'needle', label: 'Insulina' },
  { icon: 'pill', label: 'Remédio' },
  { icon: 'heart-pulse', label: 'Saúde' },
];

const FREQ_OPTIONS = ['Diário', 'Semanal', 'Por refeição'];

export default function MinhasMetasScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [glicemiaHoje, setGlicemiaHoje] = useState(0);
  const [refeicoesSemana, setRefeicoesSemana] = useState(0);
  const [mediaCarbs, setMediaCarbs] = useState(0);
  const [aguaConcluida, setAguaConcluida] = useState(false);
  const [atividadeConcluida, setAtividadeConcluida] = useState(false);
  const [metasCustom, setMetasCustom] = useState<MetaCustom[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoFreq, setNovoFreq] = useState('Diário');
  const [novoIcon, setNovoIcon] = useState('cup-water');

  const load = useCallback(async () => {
    try {
      const [glicemia, meals, custom] = await Promise.all([getGlicemia(), getMeals(), getMetasCustom()]);
      setGlicemiaHoje(glicemia.filter(r => isToday(r.created_at)).length);
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setRefeicoesSemana(meals.filter(m => new Date(m.created_at) >= semanaAtras).length);
      if (meals.length > 0) {
        setMediaCarbs(Math.round(meals.reduce((s, m) => s + m.total_carboidratos_g, 0) / meals.length));
      }
      setMetasCustom(custom);
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleCustom(id: string) {
    const updated = metasCustom.map(m => m.id === id ? { ...m, concluida: !m.concluida } : m);
    setMetasCustom(updated);
    await saveMetasCustom(updated);
  }

  async function handleAddMeta() {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da meta.');
      return;
    }
    const nova: MetaCustom = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      freq: novoFreq,
      icon: novoIcon,
      concluida: false,
    };
    const updated = [...metasCustom, nova];
    setMetasCustom(updated);
    await saveMetasCustom(updated);
    setNovoNome('');
    setNovoFreq('Diário');
    setNovoIcon('cup-water');
    setModalVisible(false);
  }

  async function handleDeleteMeta(id: string) {
    Alert.alert('Remover Meta', 'Deseja remover esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          const updated = metasCustom.filter(m => m.id !== id);
          setMetasCustom(updated);
          await saveMetasCustom(updated);
        },
      },
    ]);
  }

  const metasFixas = [
    { id: 'glicemia', nome: 'Medir Glicemia Hoje', freq: 'Diário', icon: 'water-outline', iconColor: colors.blue, progresso: glicemiaHoje, total: 3, unidade: ' medições', concluida: glicemiaHoje >= 3 },
    { id: 'refeicoes', nome: 'Registrar Refeições (semana)', freq: 'Semanal', icon: 'food-fork-drink', iconColor: colors.orange, progresso: refeicoesSemana, total: 7, unidade: ' refeições', concluida: refeicoesSemana >= 7 },
    { id: 'carbs', nome: 'Manter Carbos abaixo de 60g', freq: 'Por refeição', icon: 'grain', iconColor: colors.purple, progresso: mediaCarbs > 0 ? (mediaCarbs <= 60 ? 1 : 0) : 0, total: 1, unidade: mediaCarbs > 0 ? ` (média: ${mediaCarbs}g)` : '', concluida: mediaCarbs > 0 && mediaCarbs <= 60 },
  ];

  const metasToggle = [
    { id: 'agua', nome: 'Beber 2L de água', freq: 'Diário', icon: 'cup-water', iconColor: colors.cyan, concluida: aguaConcluida, onToggle: () => setAguaConcluida(v => !v) },
    { id: 'atividade', nome: 'Atividade Física 30min', freq: 'Diário', icon: 'run', iconColor: colors.green, concluida: atividadeConcluida, onToggle: () => setAtividadeConcluida(v => !v) },
  ];

  const s = makeStyles(colors);

  return (
    <View style={s.flex}>
      <ScrollView
        style={s.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />}>

        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
            <Text style={s.backText}>Minhas Metas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="plus-circle" size={28} color={colors.green} />
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>Acompanhe seu progresso!</Text>

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={s.sectionLabel}>Metas automáticas</Text>
            {metasFixas.map(meta => {
              const pct = meta.total > 0 ? meta.progresso / meta.total : 0;
              return (
                <View key={meta.id} style={s.card}>
                  <View style={s.cardHeader}>
                    <View style={[s.iconBox, { backgroundColor: meta.iconColor + '22' }]}>
                      <MaterialCommunityIcons name={meta.icon} size={20} color={meta.iconColor} />
                    </View>
                    <Text style={s.metaNome}>{meta.nome}</Text>
                    <MaterialCommunityIcons name={meta.concluida ? 'check-circle' : 'circle-outline'} size={22} color={meta.concluida ? colors.green : colors.textMuted} />
                  </View>
                  <Text style={s.freq}>{meta.freq}</Text>
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: meta.concluida ? colors.green : colors.blue }]} />
                  </View>
                  <Text style={s.progressText}>{meta.progresso}/{meta.total}{meta.unidade}</Text>
                </View>
              );
            })}

            <Text style={s.sectionLabel}>Metas do dia</Text>
            {metasToggle.map(meta => (
              <TouchableOpacity key={meta.id} style={s.card} onPress={meta.onToggle} activeOpacity={0.7}>
                <View style={s.cardHeader}>
                  <View style={[s.iconBox, { backgroundColor: meta.iconColor + '22' }]}>
                    <MaterialCommunityIcons name={meta.icon} size={20} color={meta.iconColor} />
                  </View>
                  <Text style={s.metaNome}>{meta.nome}</Text>
                  <MaterialCommunityIcons name={meta.concluida ? 'check-circle' : 'checkbox-blank-circle-outline'} size={22} color={meta.concluida ? colors.green : colors.green} />
                </View>
                <Text style={[s.freq, { color: colors.green }]}>Toque para marcar · {meta.freq}</Text>
              </TouchableOpacity>
            ))}

            {metasCustom.length > 0 && (
              <>
                <Text style={s.sectionLabel}>Minhas metas personalizadas</Text>
                {metasCustom.map(meta => (
                  <TouchableOpacity
                    key={meta.id}
                    style={s.card}
                    onPress={() => toggleCustom(meta.id)}
                    onLongPress={() => handleDeleteMeta(meta.id)}
                    activeOpacity={0.7}>
                    <View style={s.cardHeader}>
                      <View style={[s.iconBox, { backgroundColor: colors.purple + '22' }]}>
                        <MaterialCommunityIcons name={meta.icon} size={20} color={colors.purple} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.metaNome}>{meta.nome}</Text>
                        <Text style={s.freq}>{meta.freq} · segure para remover</Text>
                      </View>
                      <MaterialCommunityIcons name={meta.concluida ? 'check-circle' : 'checkbox-blank-circle-outline'} size={22} color={meta.concluida ? colors.green : colors.green} />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modal nova meta */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nova Meta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>Nome da meta</Text>
            <View style={s.modalInput}>
              <MaterialCommunityIcons name="bullseye-arrow" size={18} color={colors.textMuted} />
              <TextInput
                style={s.modalTextInput}
                placeholder="Ex: Dormir 8 horas"
                placeholderTextColor={colors.textMuted}
                value={novoNome}
                onChangeText={setNovoNome}
              />
            </View>

            <Text style={s.modalLabel}>Frequência</Text>
            <View style={s.freqRow}>
              {FREQ_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[s.freqOption, novoFreq === f && { backgroundColor: colors.green, borderColor: colors.green }]}
                  onPress={() => setNovoFreq(f)}>
                  <Text style={[s.freqText, { color: novoFreq === f ? colors.background : colors.textMuted }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.modalLabel}>Ícone</Text>
            <View style={s.iconGrid}>
              {ICON_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item.icon}
                  style={[s.iconOption, novoIcon === item.icon && { borderColor: colors.green, backgroundColor: colors.green + '22' }]}
                  onPress={() => setNovoIcon(item.icon)}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={novoIcon === item.icon ? colors.green : colors.textMuted} />
                  <Text style={[s.iconLabel, { color: novoIcon === item.icon ? colors.green : colors.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.modalBtn} onPress={handleAddMeta}>
              <Text style={s.modalBtnText}>Criar Meta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 4 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backText: { color: colors.white, fontSize: 17, fontWeight: '700' },
    subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
    sectionLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    metaNome: { color: colors.white, fontSize: 14, fontWeight: '600', flex: 1 },
    freq: { color: colors.textMuted, fontSize: 12, marginBottom: 8, marginLeft: 46 },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 3 },
    progressText: { color: colors.textMuted, fontSize: 11, textAlign: 'right' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    modalTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    modalLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    modalInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
    modalTextInput: { flex: 1, height: 46, color: colors.white, fontSize: 15 },
    freqRow: { flexDirection: 'row', gap: 8 },
    freqOption: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
    freqText: { fontSize: 12, fontWeight: '600' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconOption: { alignItems: 'center', justifyContent: 'center', width: '22%', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, gap: 4 },
    iconLabel: { fontSize: 10 },
    modalBtn: { backgroundColor: colors.green, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    modalBtnText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  });
}
