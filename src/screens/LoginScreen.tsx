import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { colors } = useTheme();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  function trocarModo(novoModo: 'login' | 'cadastro') {
    setModo(novoModo);
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
  }

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), senha);
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.message || 'Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro() {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signUp(nome.trim(), email.trim(), senha);
    } catch (err: any) {
      Alert.alert('Erro ao criar conta', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={s.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={s.logoArea}>
          <MaterialCommunityIcons name="heart-pulse" size={48} color={colors.green} />
          <Text style={s.logo}>
            <Text style={s.logoGreen}>Glico</Text>Guide
          </Text>
          <Text style={s.title}>
            {modo === 'login' ? 'Bem-Vindo de Volta!' : 'Crie sua Conta'}
          </Text>
          <Text style={s.subtitle}>
            {modo === 'login'
              ? 'Seu Companheiro no Controle do Diabetes.'
              : 'Comece a cuidar da sua saúde hoje.'}
          </Text>
        </View>

        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, modo === 'login' && s.tabActive]}
            onPress={() => trocarModo('login')}>
            <Text style={[s.tabText, modo === 'login' && s.tabTextActive]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, modo === 'cadastro' && s.tabActive]}
            onPress={() => trocarModo('cadastro')}>
            <Text style={[s.tabText, modo === 'cadastro' && s.tabTextActive]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={s.form}>
          {modo === 'cadastro' && (
            <View style={s.inputGroup}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholderTextColor={colors.textMuted}
                placeholder="Seu nome completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={s.inputGroup}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholderTextColor={colors.textMuted}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputGroup}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholderTextColor={colors.textMuted}
              placeholder={modo === 'cadastro' ? 'Mínimo 6 caracteres' : 'Sua senha'}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          {modo === 'cadastro' && (
            <View style={s.inputGroup}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholderTextColor={colors.textMuted}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={modo === 'login' ? handleLogin : handleCadastro}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={s.btnPrimaryText}>
              {modo === 'login' ? 'Entrar' : 'Criar Conta'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 40, gap: 24 },
    logoArea: { alignItems: 'center', gap: 8 },
    logo: { fontSize: 28, fontWeight: '700', color: colors.white },
    logoGreen: { color: colors.green },
    title: { fontSize: 20, fontWeight: '600', color: colors.white, marginTop: 8 },
    subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
    tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: colors.green },
    tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: colors.background },
    form: { gap: 4 },
    inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 48, color: colors.white, fontSize: 15 },
    btnPrimary: { backgroundColor: colors.green, borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
    btnPrimaryText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  });
}
