import React, { useState, useRef } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();
  const [mensagens, setMensagens] = useState(mensagemBoasVindas);
  const [texto, setTexto] = useState('');
  const listRef = useRef<FlatList>(null);

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
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>

      <View style={s.topBar}>
        <View style={s.glicoAvatar}>
          <MaterialCommunityIcons name="robot-outline" size={20} color={colors.background} />
        </View>
        <View>
          <Text style={s.topBarTitle}>Chat do Glico</Text>
          <Text style={s.topBarSub}>Assistente de saúde</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={mensagens}
        keyExtractor={item => item.id}
        style={s.list}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.remetente === 'usuario' ? s.bubbleUser : s.bubbleGlico]}>
            {item.remetente === 'glico' && (
              <View style={s.glicoAvatarSmall}>
                <MaterialCommunityIcons name="robot-outline" size={16} color={colors.background} />
              </View>
            )}
            <View style={[
              s.bubbleContent,
              item.remetente === 'usuario' ? s.bubbleContentUser : s.bubbleContentGlico,
            ]}>
              <Text style={[s.bubbleText, item.remetente === 'usuario' && s.bubbleTextUser]}>
                {item.texto}
              </Text>
              <Text style={s.hora}>{item.hora}</Text>
            </View>
          </View>
        )}
      />

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.textMuted}
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={enviar}
        />
        <TouchableOpacity style={s.sendBtn} onPress={enviar}>
          <MaterialCommunityIcons name="send" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    glicoAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
    topBarTitle: { color: colors.white, fontSize: 15, fontWeight: '600' },
    topBarSub: { color: colors.textMuted, fontSize: 12 },
    list: { flex: 1, paddingHorizontal: 16 },
    bubble: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
    bubbleGlico: { justifyContent: 'flex-start' },
    bubbleUser: { justifyContent: 'flex-end' },
    glicoAvatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 4 },
    bubbleContent: { maxWidth: '70%', borderRadius: 16, padding: 12 },
    bubbleContentGlico: { backgroundColor: colors.card },
    bubbleContentUser: { backgroundColor: colors.green },
    bubbleText: { color: colors.white, fontSize: 13, lineHeight: 20 },
    bubbleTextUser: { color: colors.background },
    hora: { color: colors.textMuted, fontSize: 10, marginTop: 4, textAlign: 'right' },
    inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
    input: { flex: 1, backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: colors.white, fontSize: 14 },
    sendBtn: { backgroundColor: colors.green, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  });
}
