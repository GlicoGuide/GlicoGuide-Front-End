import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getUltimaAnalise, UltimaAnalise,
  getSessoesCarbo, salvarSessaoCarbo, deletarSessaoCarbo, SessaoCarbo, ItemHistorico,
} from '../services/storage';

const ALIMENTOS_BASE = [
  { nome: 'Arroz branco cozido', carbo100g: 28, icon: 'food-variant' },
  { nome: 'Arroz integral cozido', carbo100g: 23, icon: 'food-variant' },
  { nome: 'Pão de forma', carbo100g: 49, icon: 'bread-slice-outline' },
  { nome: 'Macarrão cozido', carbo100g: 25, icon: 'noodles' },
  { nome: 'Batata cozida', carbo100g: 17, icon: 'food-variant' },
  { nome: 'Batata doce cozida', carbo100g: 20, icon: 'food-variant' },
  { nome: 'Banana', carbo100g: 23, icon: 'fruit-watermelon' },
  { nome: 'Maçã', carbo100g: 14, icon: 'food-apple-outline' },
  { nome: 'Laranja', carbo100g: 12, icon: 'fruit-citrus' },
  { nome: 'Leite integral', carbo100g: 5, icon: 'cup-outline' },
  { nome: 'Iogurte natural', carbo100g: 4, icon: 'cup-outline' },
  { nome: 'Feijão cozido', carbo100g: 14, icon: 'food-variant' },
  { nome: 'Lentilha cozida', carbo100g: 20, icon: 'food-variant' },
  { nome: 'Aveia', carbo100g: 67, icon: 'grain' },
  { nome: 'Biscoito cream cracker', carbo100g: 67, icon: 'cookie-outline' },
];

interface ItemManual {
  id: string;
  nome: string;
  porcao: number;
  carbos: number;
}

const RATIO_DEFAULT = 15;

function formatDiaLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (d.toDateString() === hoje.toDateString()) return 'Hoje';
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

function formatHora(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function agruparPorDia(sessoes: SessaoCarbo[]): { label: string; sessoes: SessaoCarbo[] }[] {
  const grupos: Record<string, SessaoCarbo[]> = {};
  sessoes.forEach(s => {
    const dia = new Date(s.data).toDateString();
    if (!grupos[dia]) grupos[dia] = [];
    grupos[dia].push(s);
  });
  return Object.entries(grupos).map(([dia, sess]) => ({
    label: formatDiaLabel(sess[0].data),
    sessoes: sess,
  }));
}

export default function ContarCarboScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [aba, setAba] = useState<'contador' | 'historico'>('contador');
  const [busca, setBusca] = useState('');
  const [itensManual, setItensManual] = useState<ItemManual[]>([]);
  const [porcaoTemp, setPorcaoTemp] = useState<Record<string, string>>({});
  const [ratio, setRatio] = useState(String(RATIO_DEFAULT));
  const [ultimaAnalise, setUltimaAnalise] = useState<UltimaAnalise | null>(null);
  const [itensSelecionadosIA, setItensSelecionadosIA] = useState<Set<number>>(new Set());
  const [historico, setHistorico] = useState<SessaoCarbo[]>([]);
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set(['0']));
  const [sessoesExpandidas, setSessoesExpandidas] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [analise, hist] = await Promise.all([getUltimaAnalise(), getSessoesCarbo()]);
    if (analise) {
      setUltimaAnalise(analise);
      setItensSelecionadosIA(new Set(analise.componentes.map((_, i) => i)));
    }
    setHistorico(hist);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleIA(idx: number) {
    setItensSelecionadosIA(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function adicionarAlimento(alimento: typeof ALIMENTOS_BASE[0]) {
    const porcaoStr = porcaoTemp[alimento.nome] || '100';
    const porcao = parseFloat(porcaoStr);
    if (isNaN(porcao) || porcao <= 0) {
      Alert.alert('Atenção', 'Informe uma porção válida em gramas.');
      return;
    }
    const carbos = Math.round((alimento.carbo100g * porcao) / 100 * 10) / 10;
    setItensManual(prev => [...prev, { id: Date.now().toString(), nome: alimento.nome, porcao, carbos }]);
    setBusca('');
    setPorcaoTemp({});
  }

  function removerManual(id: string) {
    setItensManual(prev => prev.filter(i => i.id !== id));
  }

  async function salvarRefeicao() {
    if (totalCarbos === 0) {
      Alert.alert('Atenção', 'Adicione alimentos antes de salvar.');
      return;
    }

    const itensIA: ItemHistorico[] = ultimaAnalise
      ? ultimaAnalise.componentes
          .filter((_, i) => itensSelecionadosIA.has(i))
          .map(c => ({ nome: c.nome, porcao_g: c.porcao_g, carboidratos_g: c.carboidratos_g, origem: 'ia' as const }))
      : [];

    const itensManuais: ItemHistorico[] = itensManual.map(i => ({
      nome: i.nome, porcao_g: i.porcao, carboidratos_g: i.carbos, origem: 'manual' as const,
    }));

    const sessao: SessaoCarbo = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      itens: [...itensIA, ...itensManuais],
      total_carboidratos_g: totalCarbos,
      bolus_estimado_u: bolusEstimado,
      ratio: ratioNum,
    };

    await salvarSessaoCarbo(sessao);
    await load();
    setItensManual([]);
    setItensSelecionadosIA(new Set(ultimaAnalise?.componentes.map((_, i) => i) ?? []));
    setAba('historico');
    Alert.alert('Salvo!', 'Refeição registrada no histórico.');
  }

  async function handleDeletar(id: string) {
    Alert.alert('Remover', 'Deseja remover este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          await deletarSessaoCarbo(id);
          setHistorico(prev => prev.filter(s => s.id !== id));
        },
      },
    ]);
  }

  function toggleDia(label: string) {
    setDiasExpandidos(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function toggleSessao(id: string) {
    setSessoesExpandidas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const carbosIA = ultimaAnalise
    ? ultimaAnalise.componentes.filter((_, i) => itensSelecionadosIA.has(i)).reduce((s, c) => s + c.carboidratos_g, 0)
    : 0;
  const carbosManual = itensManual.reduce((s, i) => s + i.carbos, 0);
  const totalCarbos = Math.round((carbosIA + carbosManual) * 10) / 10;
  const ratioNum = parseFloat(ratio) || RATIO_DEFAULT;
  const bolusEstimado = Math.round((totalCarbos / ratioNum) * 10) / 10;

  const alimentosFiltrados = busca.length > 0
    ? ALIMENTOS_BASE.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : ALIMENTOS_BASE;

  const grupos = agruparPorDia(historico);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={s.flex}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contador de Carboidratos</Text>
      </View>

      {/* Abas */}
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, aba === 'contador' && s.tabActive]} onPress={() => setAba('contador')}>
          <MaterialCommunityIcons name="calculator-variant-outline" size={18} color={aba === 'contador' ? colors.background : colors.textMuted} />
          <Text style={[s.tabText, aba === 'contador' && s.tabTextActive]}>Contador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, aba === 'historico' && s.tabActive]} onPress={() => setAba('historico')}>
          <MaterialCommunityIcons name="history" size={18} color={aba === 'historico' ? colors.background : colors.textMuted} />
          <Text style={[s.tabText, aba === 'historico' && s.tabTextActive]}>Histórico</Text>
          {historico.length > 0 && (
            <View style={s.badge}><Text style={s.badgeText}>{historico.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {aba === 'contador' ? (
        <ScrollView style={s.container} keyboardShouldPersistTaps="handled">

          {/* Resumo */}
          <View style={[s.resumoCard, { borderColor: totalCarbos > 0 ? colors.green : colors.border }]}>
            <View style={s.resumoItem}>
              <Text style={s.resumoValor}>{totalCarbos}g</Text>
              <Text style={s.resumoLabel}>Total Carbos</Text>
              {ultimaAnalise && (
                <Text style={s.resumoDetalhe}>
                  IA: {Math.round(carbosIA * 10) / 10}g · Manual: {Math.round(carbosManual * 10) / 10}g
                </Text>
              )}
            </View>
            <View style={s.resumoDivider} />
            <View style={s.resumoItem}>
              <Text style={[s.resumoValor, { color: colors.green }]}>{bolusEstimado} U</Text>
              <Text style={s.resumoLabel}>Insulina estimada</Text>
              <View style={s.ratioRow}>
                <Text style={s.ratioLabel}>Ratio:</Text>
                <TextInput
                  style={s.ratioInput}
                  value={ratio}
                  onChangeText={setRatio}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={s.ratioLabel}>g/U</Text>
              </View>
            </View>
          </View>

          {/* Botão salvar */}
          {totalCarbos > 0 && (
            <TouchableOpacity style={s.btnSalvar} onPress={salvarRefeicao}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.background} />
              <Text style={s.btnSalvarText}>Salvar no histórico</Text>
            </TouchableOpacity>
          )}

          {/* Seção IA */}
          {ultimaAnalise && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <View style={s.iaBadge}>
                  <MaterialCommunityIcons name="robot-outline" size={13} color={colors.background} />
                  <Text style={s.iaBadgeText}>IA</Text>
                </View>
                <Text style={s.cardTitle}>Identificado pela câmera</Text>
                <Text style={s.cardDate}>
                  {new Date(ultimaAnalise.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </Text>
              </View>
              {ultimaAnalise.componentes.map((c, i) => {
                const sel = itensSelecionadosIA.has(i);
                return (
                  <TouchableOpacity key={i} style={[s.iaRow, !sel && s.iaRowOff]} onPress={() => toggleIA(i)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={sel ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={20} color={sel ? colors.green : colors.textMuted} />
                    <View style={s.iaInfo}>
                      <Text style={[s.iaNome, !sel && { color: colors.textMuted }]}>{c.nome}</Text>
                      <View style={s.pesoBadge}>
                        <MaterialCommunityIcons name="scale-outline" size={11} color={colors.textMuted} />
                        <Text style={s.iaPesoText}>{c.porcao_g}g estimado</Text>
                      </View>
                    </View>
                    <Text style={[s.iaCarbos, !sel && { color: colors.textMuted }]}>{c.carboidratos_g}g</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Itens manuais */}
          {itensManual.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.blue} />
                <Text style={s.cardTitle}>Adicionados manualmente</Text>
                <TouchableOpacity onPress={() => setItensManual([])}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </View>
              {itensManual.map(item => (
                <View key={item.id} style={s.iaRow}>
                  <MaterialCommunityIcons name="food-variant" size={18} color={colors.textMuted} />
                  <View style={s.iaInfo}>
                    <Text style={s.iaNome}>{item.nome}</Text>
                    <View style={s.pesoBadge}>
                      <MaterialCommunityIcons name="scale-outline" size={11} color={colors.textMuted} />
                      <Text style={s.iaPesoText}>{item.porcao}g</Text>
                    </View>
                  </View>
                  <Text style={[s.iaCarbos, { color: colors.blue }]}>{item.carbos}g</Text>
                  <TouchableOpacity onPress={() => removerManual(item.id)} style={{ paddingLeft: 8 }}>
                    <MaterialCommunityIcons name="minus-circle-outline" size={20} color={colors.red} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Adicionar */}
          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color={colors.textMuted} />
              <Text style={s.cardTitle}>Adicionar alimento</Text>
            </View>
            <View style={s.searchBox}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar alimento..."
                placeholderTextColor={colors.textMuted}
                value={busca}
                onChangeText={setBusca}
              />
              {busca.length > 0 && (
                <TouchableOpacity onPress={() => setBusca('')}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            {alimentosFiltrados.map(alimento => (
              <View key={alimento.nome} style={s.alimentoRow}>
                <MaterialCommunityIcons name={alimento.icon} size={18} color={colors.textMuted} />
                <View style={s.alimentoInfo}>
                  <Text style={s.alimentoNome}>{alimento.nome}</Text>
                  <Text style={s.alimentoCarbo}>{alimento.carbo100g}g carbo / 100g</Text>
                </View>
                <View style={s.alimentoRight}>
                  <MaterialCommunityIcons name="scale-outline" size={13} color={colors.textMuted} />
                  <TextInput
                    style={s.porcaoInput}
                    value={porcaoTemp[alimento.nome] ?? '100'}
                    onChangeText={v => setPorcaoTemp(prev => ({ ...prev, [alimento.nome]: v }))}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={s.gramLabel}>g</Text>
                  <TouchableOpacity style={s.addBtn} onPress={() => adicionarAlimento(alimento)}>
                    <MaterialCommunityIcons name="plus" size={18} color={colors.background} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      ) : (
        /* ABA HISTÓRICO */
        <ScrollView style={s.container}>
          {grupos.length === 0 ? (
            <View style={s.emptyBox}>
              <MaterialCommunityIcons name="history" size={48} color={colors.textMuted} />
              <Text style={s.emptyText}>Nenhum registro ainda.</Text>
              <Text style={s.emptySubText}>Salve uma refeição no contador para aparecer aqui.</Text>
            </View>
          ) : (
            grupos.map((grupo, gi) => {
              const diaKey = String(gi);
              const expandido = diasExpandidos.has(diaKey);
              const totalDia = grupo.sessoes.reduce((s, sess) => s + sess.total_carboidratos_g, 0);

              return (
                <View key={diaKey} style={s.diaGroup}>
                  {/* Cabeçalho do dia */}
                  <TouchableOpacity style={s.diaHeader} onPress={() => toggleDia(diaKey)}>
                    <View style={s.diaHeaderLeft}>
                      <MaterialCommunityIcons name="calendar-today" size={16} color={colors.green} />
                      <Text style={s.diaLabel}>{grupo.label}</Text>
                      <View style={s.diaCountBadge}>
                        <Text style={s.diaCountText}>{grupo.sessoes.length} refeição{grupo.sessoes.length !== 1 ? 'ões' : ''}</Text>
                      </View>
                    </View>
                    <View style={s.diaHeaderRight}>
                      <Text style={s.diaTotalCarbo}>{Math.round(totalDia * 10) / 10}g</Text>
                      <MaterialCommunityIcons name={expandido ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>

                  {expandido && grupo.sessoes.map(sessao => {
                    const sessExpandida = sessoesExpandidas.has(sessao.id);
                    const itensIA = sessao.itens.filter(i => i.origem === 'ia');
                    const itensManualHist = sessao.itens.filter(i => i.origem === 'manual');

                    return (
                      <View key={sessao.id} style={s.sessaoCard}>
                        <TouchableOpacity style={s.sessaoHeader} onPress={() => toggleSessao(sessao.id)} onLongPress={() => handleDeletar(sessao.id)} activeOpacity={0.8}>
                          <View style={s.sessaoHeaderLeft}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
                            <Text style={s.sessaoHora}>{formatHora(sessao.data)}</Text>
                          </View>
                          <View style={s.sessaoHeaderRight}>
                            <View style={s.sessaoTotals}>
                              <View style={s.sessaoTotalItem}>
                                <MaterialCommunityIcons name="grain" size={13} color={colors.orange} />
                                <Text style={s.sessaoTotalText}>{sessao.total_carboidratos_g}g carbo</Text>
                              </View>
                              <View style={s.sessaoTotalItem}>
                                <MaterialCommunityIcons name="needle" size={13} color={colors.green} />
                                <Text style={s.sessaoTotalText}>{sessao.bolus_estimado_u}U</Text>
                              </View>
                            </View>
                            <MaterialCommunityIcons name={sessExpandida ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                          </View>
                        </TouchableOpacity>

                        {sessExpandida && (
                          <View style={s.sessaoItens}>
                            {itensIA.length > 0 && (
                              <>
                                <View style={s.origemRow}>
                                  <View style={s.iaBadge}>
                                    <MaterialCommunityIcons name="robot-outline" size={11} color={colors.background} />
                                    <Text style={s.iaBadgeText}>IA</Text>
                                  </View>
                                  <Text style={s.origemLabel}>Identificado pela câmera</Text>
                                </View>
                                {itensIA.map((item, idx) => (
                                  <View key={idx} style={s.itemHistRow}>
                                    <View style={s.pesoBadge}>
                                      <MaterialCommunityIcons name="scale-outline" size={11} color={colors.textMuted} />
                                      <Text style={s.iaPesoText}>{item.porcao_g}g</Text>
                                    </View>
                                    <Text style={s.itemHistNome}>{item.nome}</Text>
                                    <Text style={s.itemHistCarbo}>{item.carboidratos_g}g</Text>
                                  </View>
                                ))}
                              </>
                            )}
                            {itensManualHist.length > 0 && (
                              <>
                                <View style={s.origemRow}>
                                  <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.blue} />
                                  <Text style={s.origemLabel}>Adicionados manualmente</Text>
                                </View>
                                {itensManualHist.map((item, idx) => (
                                  <View key={idx} style={s.itemHistRow}>
                                    <View style={s.pesoBadge}>
                                      <MaterialCommunityIcons name="scale-outline" size={11} color={colors.textMuted} />
                                      <Text style={s.iaPesoText}>{item.porcao_g}g</Text>
                                    </View>
                                    <Text style={s.itemHistNome}>{item.nome}</Text>
                                    <Text style={[s.itemHistCarbo, { color: colors.blue }]}>{item.carboidratos_g}g</Text>
                                  </View>
                                ))}
                              </>
                            )}
                            <Text style={s.sessaoHint}>Segure para remover</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    back: {},
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '600' },
    tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12, padding: 4 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
    tabActive: { backgroundColor: colors.green },
    tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
    tabTextActive: { color: colors.background },
    badge: { backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
    badgeText: { color: colors.green, fontSize: 10, fontWeight: '700' },
    container: { flex: 1, paddingHorizontal: 16 },
    resumoCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1.5, justifyContent: 'space-around', alignItems: 'center' },
    resumoItem: { alignItems: 'center', gap: 4 },
    resumoValor: { color: colors.white, fontSize: 32, fontWeight: '700' },
    resumoLabel: { color: colors.textMuted, fontSize: 12 },
    resumoDetalhe: { color: colors.textMuted, fontSize: 10 },
    resumoDivider: { width: 1, height: 60, backgroundColor: colors.border },
    ratioRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratioLabel: { color: colors.textMuted, fontSize: 11 },
    ratioInput: { width: 36, color: colors.white, fontSize: 13, fontWeight: '700', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: colors.green },
    btnSalvar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
    btnSalvarText: { color: colors.background, fontSize: 15, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    cardTitle: { color: colors.white, fontSize: 15, fontWeight: '700', flex: 1 },
    cardDate: { color: colors.textMuted, fontSize: 12 },
    iaBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.green, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
    iaBadgeText: { color: colors.background, fontSize: 10, fontWeight: '800' },
    iaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    iaRowOff: { opacity: 0.45 },
    iaInfo: { flex: 1 },
    iaNome: { color: colors.white, fontSize: 14, fontWeight: '500' },
    pesoBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    iaPesoText: { color: colors.textMuted, fontSize: 11 },
    iaCarbos: { color: colors.green, fontSize: 14, fontWeight: '700' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, gap: 8 },
    searchInput: { flex: 1, height: 44, color: colors.white, fontSize: 14 },
    alimentoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    alimentoInfo: { flex: 1 },
    alimentoNome: { color: colors.white, fontSize: 13 },
    alimentoCarbo: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
    alimentoRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    porcaoInput: { width: 44, height: 32, backgroundColor: colors.background, borderRadius: 8, color: colors.white, fontSize: 13, textAlign: 'center' },
    gramLabel: { color: colors.textMuted, fontSize: 11 },
    addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
    // Histórico
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    emptySubText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
    diaGroup: { marginBottom: 12 },
    diaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
    diaHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    diaLabel: { color: colors.white, fontSize: 14, fontWeight: '700' },
    diaCountBadge: { backgroundColor: colors.cardAlt, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
    diaCountText: { color: colors.textMuted, fontSize: 11 },
    diaHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    diaTotalCarbo: { color: colors.orange, fontSize: 14, fontWeight: '700' },
    sessaoCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 4, overflow: 'hidden' },
    sessaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
    sessaoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sessaoHora: { color: colors.textMuted, fontSize: 13 },
    sessaoHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sessaoTotals: { gap: 3 },
    sessaoTotalItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sessaoTotalText: { color: colors.white, fontSize: 12, fontWeight: '600' },
    sessaoItens: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border },
    origemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
    origemLabel: { color: colors.textMuted, fontSize: 12 },
    itemHistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    itemHistNome: { color: colors.white, fontSize: 13, flex: 1 },
    itemHistCarbo: { color: colors.green, fontSize: 13, fontWeight: '600' },
    sessaoHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 },
  });
}
