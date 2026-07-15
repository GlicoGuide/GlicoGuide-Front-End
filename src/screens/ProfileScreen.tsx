import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getGlicemia, getPontos, exportarDados, excluirConta, GlicemiaRecord } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import LegalModal from '../components/LegalModal';

function calcStats(registros: GlicemiaRecord[]) {
  if (registros.length === 0) return null;
  const media = Math.round(registros.reduce((s, r) => s + r.valor_mgdl, 0) / registros.length);
  const noAlvo = registros.filter(r => r.valor_mgdl >= 70 && r.valor_mgdl <= 180).length;
  const tempoNoAlvo = Math.round((noAlvo / registros.length) * 100);
  const ultima = registros[registros.length - 1];
  return { media, tempoNoAlvo, total: registros.length, ultima };
}

function statusColor(valor: number, colors: any) {
  if (valor < 70) return colors.red;
  if (valor <= 140) return colors.green;
  if (valor <= 180) return colors.yellow;
  return colors.red;
}

function statusLabel(valor: number) {
  if (valor < 70) return 'Baixa';
  if (valor <= 140) return 'Normal';
  if (valor <= 180) return 'Alta';
  return 'Muito Alta';
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [glicemia,  setGlicemia]  = useState<GlicemiaRecord[]>([]);
  const [pontos,    setPontos]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Config mockada
  const [notificacoes, setNotificacoes] = useState(true);
  const [lembreteGlicemia, setLembreteGlicemia] = useState(true);
  const [unidadeMgdl, setUnidadeMgdl] = useState(true);

  const [legalAberto, setLegalAberto] = useState<'privacidade' | 'termos' | null>(null);
  const [exportando, setExportando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const load = useCallback(async () => {
    try {
      const [glicemiaData, pontosData] = await Promise.all([
        getGlicemia(),
        getPontos(),
      ]);
      setGlicemia(glicemiaData);
      setPontos(pontosData.total_pontos);
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = calcStats(glicemia);
  const displayName = user?.name || user?.email || 'Usuário';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  async function handleExportarDados() {
    // sem tela própria pra isso ainda — usa o share sheet do sistema mesmo,
    // assim o usuário escolhe salvar/enviar o JSON como quiser

    setExportando(true);
    try {
      const dados = await exportarDados();
      await Share.share({
        title: 'Meus dados - GlicoGuide',
        message: JSON.stringify(dados, null, 2),
      });
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível exportar seus dados.');
    } finally {
      setExportando(false);
    }
  }

  function handleExcluirConta() {
    Alert.alert(
      'Excluir conta',
      'Isso apaga permanentemente sua conta, glicemias, refeições e GlicoPoints. Essa ação não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir permanentemente',
          style: 'destructive',
          onPress: async () => {
            setExcluindo(true);
            try {
              await excluirConta();
              await signOut();
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Não foi possível excluir a conta.');
            } finally {
              setExcluindo(false);
            }
          },
        },
      ],
    );
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.green} />
      }>

      {/* Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={s.name}>{displayName}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.pointsBadge}>
          <MaterialCommunityIcons name="star-circle" size={16} color={colors.yellow} />
          <Text style={s.pointsText}>{pontos} GlicoPoints</Text>
        </View>
      </View>

      {/* Glicemia */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <MaterialCommunityIcons name="water-outline" size={18} color={colors.blue} />
          <Text style={s.cardTitle}>Minha Glicemia</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 12 }} />
        ) : stats ? (
          <>
            <View style={s.statsRow}>
              <View style={s.stat}>
                <Text style={[s.statValue, { color: colors.green }]}>{stats.tempoNoAlvo}%</Text>
                <Text style={s.statLabel}>Tempo no{'\n'}Alvo</Text>
              </View>
              <View style={s.stat}>
                <Text style={s.statValue}>{stats.media}</Text>
                <Text style={s.statLabel}>Média{'\n'}mg/dL</Text>
              </View>
              <View style={s.stat}>
                <Text style={s.statValue}>{stats.total}</Text>
                <Text style={s.statLabel}>Medições{'\n'}totais</Text>
              </View>
            </View>
            {stats.ultima && (
              <View style={s.ultimaRow}>
                <Text style={s.ultimaLabel}>Última medição</Text>
                <View style={s.ultimaRight}>
                  <Text style={s.ultimaValor}>{stats.ultima.valor_mgdl} mg/dL</Text>
                  <View style={[s.badge, { backgroundColor: statusColor(stats.ultima.valor_mgdl, colors) + '33' }]}>
                    <Text style={[s.badgeText, { color: statusColor(stats.ultima.valor_mgdl, colors) }]}>
                      {statusLabel(stats.ultima.valor_mgdl)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={s.emptyBox}>
            <MaterialCommunityIcons name="chart-line" size={32} color={colors.textMuted} />
            <Text style={s.empty}>Nenhuma medição registrada ainda.</Text>
          </View>
        )}
      </View>

      {/* Configurações */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <MaterialCommunityIcons name="cog-outline" size={18} color={colors.textMuted} />
          <Text style={s.cardTitle}>Configurações</Text>
        </View>

        <ConfigItem icon="bell-outline" label="Notificações" value={notificacoes} onToggle={() => setNotificacoes(v => !v)} colors={colors} />
        <ConfigItem icon="water-outline" label="Lembrete de Glicemia" value={lembreteGlicemia} onToggle={() => setLembreteGlicemia(v => !v)} colors={colors} />
        <ConfigItem
          icon={isDark ? 'weather-night' : 'white-balance-sunny'}
          label={isDark ? 'Modo Escuro' : 'Modo Claro'}
          value={isDark}
          onToggle={toggleTheme}
          colors={colors}
        />
        <ConfigItem icon="ruler" label="Unidade mg/dL" value={unidadeMgdl} onToggle={() => setUnidadeMgdl(v => !v)} colors={colors} last />
      </View>

      {/* Sobre */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.textMuted} />
          <Text style={s.cardTitle}>Sobre</Text>
        </View>
        <InfoRow icon="tag-outline" label="Versão" value="1.0.0" colors={colors} />
        <InfoRow icon="shield-check-outline" label="Privacidade" value="Ver política" onPress={() => setLegalAberto('privacidade')} colors={colors} />
        <InfoRow icon="file-document-outline" label="Termos de uso" value="Ver termos" onPress={() => setLegalAberto('termos')} colors={colors} last />
      </View>

      {/* Privacidade e Dados (LGPD) */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color={colors.textMuted} />
          <Text style={s.cardTitle}>Privacidade e Dados</Text>
        </View>

        <TouchableOpacity style={[s.configRow, s.configRowBorder]} onPress={handleExportarDados} disabled={exportando}>
          <MaterialCommunityIcons name="download-outline" size={20} color={colors.textMuted} />
          <Text style={s.configLabel}>Exportar meus dados</Text>
          {exportando ? <ActivityIndicator color={colors.green} /> : <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.configRow} onPress={handleExcluirConta} disabled={excluindo}>
          <MaterialCommunityIcons name="delete-outline" size={20} color={colors.red} />
          <Text style={[s.configLabel, { color: colors.red }]}>Excluir minha conta</Text>
          {excluindo ? <ActivityIndicator color={colors.red} /> : <MaterialCommunityIcons name="chevron-right" size={18} color={colors.red} />}
        </TouchableOpacity>
      </View>

      {/* Sair */}
      <TouchableOpacity style={s.btnSair} onPress={handleSignOut}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.red} />
        <Text style={s.btnSairText}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
    <LegalModal
      visible={legalAberto !== null}
      tipo={legalAberto ?? 'privacidade'}
      onClose={() => setLegalAberto(null)}
    />
    </SafeAreaView>
  );
}

function ConfigItem({ icon, label, value, onToggle, last = false, colors }: {
  icon: string; label: string; value: boolean; onToggle: () => void; last?: boolean; colors: any;
}) {
  const s = makeStyles(colors);
  return (
    <View style={[s.configRow, !last && s.configRowBorder]}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} />
      <Text style={s.configLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.border, true: colors.green }} thumbColor={colors.white} />
    </View>
  );
}

function InfoRow({ icon, label, value, last = false, onPress, colors }: {
  icon: string; label: string; value: string; last?: boolean; onPress?: () => void; colors: any;
}) {
  const s = makeStyles(colors);
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[s.configRow, !last && s.configRowBorder]} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} />
      <Text style={s.configLabel}>{label}</Text>
      <Text style={[s.infoValue, onPress && { color: colors.green }]}>{value}</Text>
      {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />}
    </Wrapper>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    header: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, gap: 6 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    avatarText: { color: colors.background, fontSize: 32, fontWeight: '700' },
    name: { color: colors.white, fontSize: 20, fontWeight: '700' },
    email: { color: colors.textMuted, fontSize: 13 },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 },
    pointsText: { color: colors.yellow, fontSize: 13, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    stat: { alignItems: 'center' },
    statValue: { color: colors.white, fontSize: 26, fontWeight: '700' },
    statLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
    ultimaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    ultimaLabel: { color: colors.textMuted, fontSize: 13 },
    ultimaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ultimaValor: { color: colors.white, fontSize: 14, fontWeight: '600' },
    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    emptyBox: { alignItems: 'center', paddingVertical: 12, gap: 8 },
    empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    configRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    configRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    configLabel: { color: colors.white, fontSize: 14, flex: 1 },
    infoValue: { color: colors.textMuted, fontSize: 13 },
    btnSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 14, marginTop: 4 },
    btnSairText: { color: colors.red, fontSize: 15, fontWeight: '600' },
  });
}
