import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import colors from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>
            <Text style={styles.logoGreen}>Glico</Text>Guide
          </Text>
          <Text style={styles.title}>Bem-Vindo de Volta!</Text>
          <Text style={styles.subtitle}>
            Seu Companheiro no Controle do Diabetes.
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.replace('Main')}>
            <Text style={styles.btnPrimaryText}>Entra</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Cria conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 32,
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  logoGreen: {
    color: colors.green,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
    marginBottom: 12,
  },
  buttons: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: colors.green,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
  },
  btnSecondaryText: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '600',
  },
});
