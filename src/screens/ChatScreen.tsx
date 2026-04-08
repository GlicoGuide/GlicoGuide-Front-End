import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import colors from '../theme/colors';

type Mensagem = {
  id: string;
  texto: string;
  remetente: 'glico' | 'usuario';
  hora: string;
};

const mensagemBoasVindas: Mensagem[] = [
  {
    id: '0',
    texto: 'Oi! Eu sou o Glico. Como posso te ajudar hoje?',
    remetente: 'glico',
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
];

export default function ChatScreen() {
  const [mensagens, setMensagens] = useState(mensagemBoasVindas);
  const [texto, setTexto] = useState('');

  const enviar = () => {
    if (!texto.trim()) return;
    const nova: Mensagem = {
      id: Date.now().toString(),
      texto: texto.trim(),
      remetente: 'usuario',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMensagens(prev => [...prev, nova]);
    setTexto('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <Text style={styles.title}>Chat do Glico</Text>

      <FlatList
        data={mensagens}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.remetente === 'usuario' ? styles.bubbleUser : styles.bubbleGlico,
            ]}>
            {item.remetente === 'glico' && (
              <View style={styles.glicoAvatar}>
                <Text style={styles.glicoAvatarText}>G</Text>
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              item.remetente === 'usuario' ? styles.bubbleContentUser : styles.bubbleContentGlico,
            ]}>
              <Text style={[
                styles.bubbleText,
                item.remetente === 'usuario' && styles.bubbleTextUser,
              ]}>
                {item.texto}
              </Text>
              <Text style={styles.hora}>{item.hora}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.textMuted}
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={enviar}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={enviar}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  bubbleGlico: {
    justifyContent: 'flex-start',
  },
  bubbleUser: {
    justifyContent: 'flex-end',
  },
  glicoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  glicoAvatarText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  bubbleContent: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleContentGlico: {
    backgroundColor: colors.card,
  },
  bubbleContentUser: {
    backgroundColor: colors.green,
  },
  bubbleText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.background,
  },
  hora: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: colors.green,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: colors.background,
    fontSize: 16,
  },
});
