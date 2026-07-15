import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Switch, ScrollView,
  StyleSheet, TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { getLembretes, saveLembretes, Lembrete } from '../services/storage';
import {
  solicitarPermissaoNotificacao, sincronizarNotificacoes,
  agendarNotificacao, cancelarNotificacao,
} from '../services/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';


const ICONS = [
  { icon: 'needle', label: 'Insulina' },
  { icon: 'water-outline', label: 'Glicemia' },
  { icon: 'pill', label: 'Medicamento' },
  { icon: 'run', label: 'Atividade' },
  { icon: 'cup-water', label: 'Água' },
  { icon: 'food-apple-outline', label: 'Refeição' },
];

export default function LembretesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [horario, setHorario] = useState('');
  const [iconSelecionado, setIconSelecionado] = useState('needle');
  const [salvando, setSalvando] = useState(false);

  const load = useCallback(async () => {
    const data = await getLembretes();
    setLembretes(data);
    setLoading(false);

    const permitido = await solicitarPermissaoNotificacao();
    if (permitido) await sincronizarNotificacoes(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string) {
    const updated = lembretes.map(l => l.id === id ? { ...l, ativo: !l.ativo } : l);
    setLembretes(updated);
    await saveLembretes(updated);
    const alterado = updated.find(l => l.id === id);
    if (alterado) await agendarNotificacao(alterado);
  }

  async function handleAdicionar() {
    if (!nome.trim() || !horario.trim()) {
      Alert.alert('Atenção', 'Preencha o nome e o horário.');
      return;
    }
    // valida formato HH:MM
    if (!/^\d{2}:\d{2}$/.test(horario)) {
      Alert.alert('Atenção', 'Use o formato HH:MM (ex: 08:00).');
      return;
    }
    setSalvando(true);
    const novo: Lembrete = {
      id: Date.now().toString(),
      nome: nome.trim(),
      horario,
      ativo: true,
      icon: iconSelecionado,
    };
    const updated = [...lembretes, novo].sort((a, b) => a.horario.localeCompare(b.horario));
    setLembretes(updated);
    await saveLembretes(updated);
    await agendarNotificacao(novo);
    setNome('');
    setHorario('');
    setIconSelecionado('needle');
    setSalvando(false);
    setModalVisible(false);
  }

  async function handleDeletar(id: string) {
    Alert.alert('Remover', 'Deseja remover este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          const updated = lembretes.filter(l => l.id !== id);
          setLembretes(updated);
          await saveLembretes(updated);
          await cancelarNotificacao(id);
        },
      },
    ]);
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={s.flex}>
      <ScrollView style={s.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
          <Text style={s.backText}>Lembretes</Text>
        </TouchableOpacity>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Lembretes & Alarmes</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name="plus-circle" size={28} color={colors.green} />
            </TouchableOpacity>
          </View>

          <View style={s.banner}>
            <MaterialCommunityIcons name="bell-ring-outline" size={20} color={colors.background} />
            <Text style={s.bannerText}>Ative as notificações para não esquecer suas doses!</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
          ) : lembretes.length === 0 ? (
            <View style={s.emptyBox}>
              <MaterialCommunityIcons name="bell-off-outline" size={36} color={colors.textMuted} />
              <Text style={s.emptyText}>Nenhum lembrete ainda.</Text>
              <Text style={s.emptySubText}>Toque em + para adicionar.</Text>
            </View>
          ) : (
            lembretes.map(l => (
              <TouchableOpacity key={l.id} style={s.lembrete} onLongPress={() => handleDeletar(l.id)} activeOpacity={0.8}>
                <View style={[s.lembreteIcon, { backgroundColor: l.ativo ? colors.green + '22' : colors.border }]}>
                  <MaterialCommunityIcons name={l.icon} size={20} color={l.ativo ? colors.green : colors.textMuted} />
                </View>
                <View style={s.lembreteInfo}>
                  <Text style={s.lembreteNome}>{l.nome}</Text>
                  <View style={s.horarioRow}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textMuted} />
                    <Text style={s.lembreteHora}>{l.horario}</Text>
                  </View>
                </View>
                <Switch
                  value={l.ativo}
                  onValueChange={() => toggle(l.id)}
                  trackColor={{ false: colors.border, true: colors.green }}
                  thumbColor={colors.white}
                />
              </TouchableOpacity>
            ))
          )}
          {lembretes.length > 0 && (
            <Text style={s.hint}>Segure um lembrete para remover</Text>
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modal novo lembrete */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Novo Lembrete</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>Nome</Text>
            <View style={s.modalInput}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={s.modalTextInput}
                placeholder="Ex: Lantus Basal"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <Text style={s.modalLabel}>Horário</Text>
            <View style={s.modalInput}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={s.modalTextInput}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
                value={horario}
                onChangeText={setHorario}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <Text style={s.modalLabel}>Tipo</Text>
            <View style={s.iconGrid}>
              {ICONS.map(item => (
                <TouchableOpacity
                  key={item.icon}
                  style={[s.iconOption, iconSelecionado === item.icon && { borderColor: colors.green, backgroundColor: colors.green + '22' }]}
                  onPress={() => setIconSelecionado(item.icon)}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={iconSelecionado === item.icon ? colors.green : colors.textMuted} />
                  <Text style={[s.iconLabel, { color: iconSelecionado === item.icon ? colors.green : colors.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[s.modalBtn, salvando && { opacity: 0.7 }]} onPress={handleAdicionar} disabled={salvando}>
              {salvando
                ? <ActivityIndicator color={colors.background} />
                : <Text style={s.modalBtnText}>Adicionar Lembrete</Text>}
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
    back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 16 },
    backText: { color: colors.white, fontSize: 17, fontWeight: '600' },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { color: colors.white, fontSize: 15, fontWeight: '600' },
    addBtn: {},
    banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cyan, borderRadius: 10, padding: 12, marginBottom: 16 },
    bannerText: { color: colors.background, fontSize: 13, fontWeight: '500', flex: 1 },
    lembrete: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardAlt, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
    lembreteIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    lembreteInfo: { flex: 1 },
    lembreteNome: { color: colors.white, fontSize: 14, fontWeight: '500' },
    horarioRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    lembreteHora: { color: colors.textMuted, fontSize: 12 },
    emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyText: { color: colors.textMuted, fontSize: 14 },
    emptySubText: { color: colors.textMuted, fontSize: 12 },
    hint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    modalTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    modalLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    modalInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
    modalTextInput: { flex: 1, height: 46, color: colors.white, fontSize: 15 },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconOption: { alignItems: 'center', justifyContent: 'center', width: '30%', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, gap: 4 },
    iconLabel: { fontSize: 11 },
    modalBtn: { backgroundColor: colors.green, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    modalBtnText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  });
}
