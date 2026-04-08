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
import { launchCamera } from 'react-native-image-picker';
import { analisarPrato, AnaliseResult } from '../services/api';
import colors from '../theme/colors';

export default function AnaliseDePratoScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [glicemia, setGlicemia] = useState('');
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

    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) {
          setImageUri(asset.uri);
          setResultado(null);
        }
      },
    );
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
      const res = await analisarPrato(imageUri, glicVal);
      setResultado(res);
    } catch (err: any) {
      Alert.alert('Erro na análise', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Análise de Prato</Text>
        </TouchableOpacity>

        {/* Área da foto */}
        <TouchableOpacity style={styles.photoArea} onPress={handleTirarFoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.photoHint}>Toque para tirar a foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Glicemia atual */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Glicemia atual (mg/dL)</Text>
          <TextInput
            style={styles.input}
            value={glicemia}
            onChangeText={setGlicemia}
            keyboardType="numeric"
            placeholder="Ex: 180"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Botão analisar */}
        <TouchableOpacity
          style={[styles.btn, (loading || !imageUri) && { opacity: 0.6 }]}
          onPress={handleAnalisar}
          disabled={loading || !imageUri}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.btnText}>Analisar Refeição</Text>
          )}
        </TouchableOpacity>

        {/* Trocar foto */}
        {imageUri && !loading && (
          <TouchableOpacity style={styles.btnOutline} onPress={handleTirarFoto}>
            <Text style={styles.btnOutlineText}>📷  Trocar Foto</Text>
          </TouchableOpacity>
        )}

        {/* Resultado */}
        {resultado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado da Análise</Text>

            <Text style={styles.resultSection}>Alimentos detectados</Text>
            {resultado.analise_refeicao.componentes.map((c, i) => (
              <View key={i} style={styles.resultRow}>
                <Text style={styles.resultItem}>{c.nome}</Text>
                <Text style={styles.resultValue}>{c.carboidratos_g}g carbo</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total de carboidratos</Text>
              <Text style={styles.resultHighlight}>
                {resultado.analise_refeicao.total_carboidratos_g}g
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Insulina da refeição</Text>
              <Text style={styles.resultValue}>
                {resultado.calculo_insulina.bolus_refeicao_u.toFixed(1)} U
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Insulina de correção</Text>
              <Text style={styles.resultValue}>
                {resultado.calculo_insulina.bolus_correcao_u.toFixed(1)} U
              </Text>
            </View>

            <View style={styles.bolusTotalBox}>
              <Text style={styles.bolusTotalLabel}>Insulina Total</Text>
              <Text style={styles.bolusTotalValue}>
                {resultado.calculo_insulina.bolus_total_u.toFixed(1)} U
              </Text>
            </View>

            {resultado.analise_refeicao.observacoes ? (
              <Text style={styles.obs}>{resultado.analise_refeicao.observacoes}</Text>
            ) : null}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
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
  photoArea: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.card,
    height: 220,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraIcon: {
    fontSize: 48,
  },
  photoHint: {
    color: colors.textMuted,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
  },
  btn: {
    backgroundColor: colors.green,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  btnOutline: {
    borderRadius: 30,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
    marginBottom: 16,
  },
  btnOutlineText: {
    color: colors.green,
    fontSize: 15,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  resultTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultSection: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultItem: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  resultValue: {
    color: colors.textMuted,
    fontSize: 13,
  },
  resultLabel: {
    color: colors.white,
    fontSize: 14,
  },
  resultHighlight: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  bolusTotalBox: {
    backgroundColor: colors.green,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bolusTotalLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  bolusTotalValue: {
    color: colors.background,
    fontSize: 22,
    fontWeight: '700',
  },
  obs: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
