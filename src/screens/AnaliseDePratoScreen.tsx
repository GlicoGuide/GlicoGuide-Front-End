import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function AnaliseDePratoScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Análise de Prato</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.cameraCircle}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>

        <Text style={styles.title}>Análise de Prato</Text>
        <Text style={styles.desc}>
          Tire uma foto da sua refeição e deixe o GlicoGuide identificar os alimentos e te dê dicas!
        </Text>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>📷  Tirar Foto</Text>
      </TouchableOpacity>
    </View>
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
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  cameraCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 40,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  desc: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  btn: {
    backgroundColor: colors.green,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  btnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
