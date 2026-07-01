import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera } from 'react-native-image-picker';
import { analisarPrato, AnaliseResult } from '../services/api';
import { salvarUltimaAnalise } from '../services/storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AnaliseDePratoScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [glicemia, setGlicemia] = useState('');
  const [pesoPrato, setPesoPrato] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AnaliseResult | null>(null);

  async function handleTirarFoto() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permissão de Câmera',
          message: 'O GlicoGuide precisa acessar a câmera para analisar seu prato.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permissão negada', 'Câmera necessária para analisar o prato.');
        return;
      }
    }
    launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setImageUri(asset.uri);
        setResultado(null);
      }
    });
  }

  async function handleAnalisar() {
    if (!imageUri) {
      Alert.alert('Atenção', 'Tire uma foto primeiro.');
      return;
    }
    const glicVal = parseInt(glicemia, 10);
    if (!glicemia || isNaN(glicVal)) {
      Alert.alert('Atenção', 'Informe sua glicemia atual.');
      return;
    }
    setLoading(true);
    try {
      const pesoVal = pesoPrato ? parseFloat(pesoPrato) : undefined;
      const res = await analisarPrato(imageUri, glicVal, pesoVal);
      setResultado(res);
      await salvarUltimaAnalise({
        data: new Date().toISOString(),
        componentes: res.analise_refeicao.componentes,
        total_carboidratos_g: res.analise_refeicao.total_carboidratos_g,
        observacoes: res.analise_refeicao.observacoes,
      });
    } catch (err: any) {
      Alert.alert('Erro na análise', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
          <Text style={s.backText}>Análise de Prato</Text>
        </TouchableOpacity>

        {/* Área da foto */}
        <TouchableOpacity style={s.photoArea} onPress={handleTirarFoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-outline" size={48} color={colors.textMuted} />
              <Text style={s.photoHint}>Toque para tirar a foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Peso do prato */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Peso do prato (g) <Text style={s.labelOpcional}>— opcional</Text></Text>
          <View style={s.inputWrapper}>
            <MaterialCommunityIcons name="scale-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={s.input}
              value={pesoPrato}
              onChangeText={setPesoPrato}
              keyboardType="numeric"
              placeholder="Ex: 350"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Glicemia atual */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Glicemia atual (mg/dL)</Text>
          <View style={s.inputWrapper}>
            <MaterialCommunityIcons name="water-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={s.input}
              value={glicemia}
              onChangeText={setGlicemia}
              keyboardType="numeric"
              placeholder="Ex: 180"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[s.btn, (loading || !imageUri) && { opacity: 0.6 }]}
          onPress={handleAnalisar}
          disabled={loading || !imageUri}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <MaterialCommunityIcons name="magnify-scan" size={20} color={colors.background} />
              <Text style={s.btnText}>Analisar Refeição</Text>
            </>
          )}
        </TouchableOpacity>

        {imageUri && !loading && (
          <TouchableOpacity style={s.btnOutline} onPress={handleTirarFoto}>
            <MaterialCommunityIcons name="camera-retake-outline" size={18} color={colors.green} />
            <Text style={s.btnOutlineText}>Trocar Foto</Text>
          </TouchableOpacity>
        )}

        {/* Resultado */}
        {resultado && (
          <View style={s.resultCard}>
            <View style={s.resultTitleRow}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={colors.green} />
              <Text style={s.resultTitle}>Resultado da Análise</Text>
            </View>

            <Text style={s.resultSection}>Alimentos detectados</Text>
            {resultado.analise_refeicao.componentes.map((c, i) => (
              <View key={i} style={s.resultRow}>
                <MaterialCommunityIcons name="food-variant" size={14} color={colors.textMuted} />
                <Text style={s.resultItem}>{c.nome}</Text>
                <Text style={s.resultValue}>{c.carboidratos_g}g carbo</Text>
              </View>
            ))}

            <View style={s.divider} />

            <View style={s.resultRow}>
              <MaterialCommunityIcons name="grain" size={14} color={colors.textMuted} />
              <Text style={s.resultLabel}>Total de carboidratos</Text>
              <Text style={s.resultHighlight}>{resultado.analise_refeicao.total_carboidratos_g}g</Text>
            </View>
            <View style={s.resultRow}>
              <MaterialCommunityIcons name="needle" size={14} color={colors.textMuted} />
              <Text style={s.resultLabel}>Insulina da refeição</Text>
              <Text style={s.resultValue}>{resultado.calculo_insulina.bolus_refeicao_u.toFixed(1)} U</Text>
            </View>
            <View style={s.resultRow}>
              <MaterialCommunityIcons name="needle" size={14} color={colors.textMuted} />
              <Text style={s.resultLabel}>Insulina de correção</Text>
              <Text style={s.resultValue}>{resultado.calculo_insulina.bolus_correcao_u.toFixed(1)} U</Text>
            </View>

            <View style={s.bolusTotalBox}>
              <View style={s.bolusTotalLeft}>
                <MaterialCommunityIcons name="needle" size={20} color={colors.background} />
                <Text style={s.bolusTotalLabel}>Insulina Total</Text>
              </View>
              <Text style={s.bolusTotalValue}>{resultado.calculo_insulina.bolus_total_u.toFixed(1)} U</Text>
            </View>

            {resultado.analise_refeicao.observacoes ? (
              <View style={s.obsRow}>
                <MaterialCommunityIcons name="information-outline" size={16} color={colors.textMuted} />
                <Text style={s.obs}>{resultado.analise_refeicao.observacoes}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 16 },
    backText: { color: colors.white, fontSize: 17, fontWeight: '600' },
    photoArea: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: colors.card, height: 220 },
    photo: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    photoHint: { color: colors.textMuted, fontSize: 14 },
    inputGroup: { marginBottom: 16 },
    label: { color: colors.white, fontSize: 14, marginBottom: 8, fontWeight: '500' },
    labelOpcional: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
    input: { flex: 1, height: 48, color: colors.white, fontSize: 15 },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 30, height: 52, marginBottom: 12 },
    btnText: { color: colors.background, fontSize: 16, fontWeight: '700' },
    btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 30, height: 48, borderWidth: 1, borderColor: colors.green, marginBottom: 16 },
    btnOutlineText: { color: colors.green, fontSize: 15, fontWeight: '600' },
    resultCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 8 },
    resultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    resultTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
    resultSection: { color: colors.textMuted, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    resultItem: { color: colors.white, fontSize: 14, flex: 1 },
    resultValue: { color: colors.textMuted, fontSize: 13 },
    resultLabel: { color: colors.white, fontSize: 14, flex: 1 },
    resultHighlight: { color: colors.green, fontSize: 14, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    bolusTotalBox: { backgroundColor: colors.green, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    bolusTotalLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bolusTotalLabel: { color: colors.background, fontSize: 15, fontWeight: '600' },
    bolusTotalValue: { color: colors.background, fontSize: 22, fontWeight: '700' },
    obsRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-start' },
    obs: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic', lineHeight: 18, flex: 1 },
  });
}
