import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

type Tipo = 'privacidade' | 'termos';

interface Props {
  visible: boolean;
  tipo: Tipo;
  onClose: () => void;
}

const TITULOS: Record<Tipo, string> = {
  privacidade: 'Política de Privacidade',
  termos: 'Termos de Uso',
};

const PRIVACIDADE = `Última atualização: julho de 2026

1. Quais dados coletamos
Coletamos os dados que você fornece diretamente: nome, e-mail e senha (armazenada de forma criptografada). Também coletamos dados de saúde que você registra no app: medições de glicemia, fotos e descrições de refeições, estimativas de carboidratos e doses de insulina, mensagens trocadas com o Chat Amigo, e suas metas e anotações de diário.

2. Como usamos seus dados
Usamos esses dados exclusivamente para oferecer as funcionalidades do GlicoGuide: calcular doses de bolus, estimar carboidratos a partir de fotos de pratos, gerar relatórios e alertas de glicemia, responder no chat e acompanhar seu progresso e GlicoPoints.

3. Compartilhamento com terceiros
Para analisar fotos de refeições e responder no chat, enviamos as informações necessárias (imagem do prato e/ou contexto de saúde recente) à OpenAI, que processa esses dados para gerar a resposta. As imagens não são armazenadas em nossos servidores — são processadas e descartadas. Não vendemos nem compartilhamos seus dados de saúde com terceiros para fins de publicidade.

4. Onde seus dados ficam armazenados
Dados de conta, glicemia, refeições e pontos ficam em nosso banco de dados. Diário, lembretes e metas personalizadas ficam salvos localmente no seu dispositivo.

5. Seus direitos (LGPD)
Você pode, a qualquer momento, exportar uma cópia de todos os seus dados ou excluir permanentemente sua conta e todos os dados associados, diretamente na tela de Perfil > Privacidade e Dados.

6. Retenção
Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir a conta, os dados de glicemia, refeições e pontos são apagados permanentemente do nosso banco de dados.

7. Contato
Dúvidas sobre privacidade podem ser enviadas para contato@glicoguide.app.`;

const TERMOS = `Última atualização: julho de 2026

1. Sobre o GlicoGuide
O GlicoGuide é um aplicativo de apoio ao autocuidado no diabetes. Ele ajuda a registrar glicemia, estimar carboidratos e calcular sugestões de dose de insulina com base nos parâmetros que você configura.

2. Não substitui orientação médica
O GlicoGuide não é um dispositivo médico e não substitui a orientação de médicos, endocrinologistas ou nutricionistas. As sugestões de dose de insulina e estimativas de carboidratos são apoios ao seu controle, mas todas as decisões de tratamento devem ser validadas com sua equipe de saúde.

3. Precisão das estimativas
As estimativas de carboidratos geradas por análise de imagem podem conter erros. Sempre confira os valores antes de aplicar qualquer dose de insulina.

4. Sua conta
Você é responsável por manter sua senha em sigilo e pelas informações que registra no app. Você pode encerrar sua conta a qualquer momento na tela de Perfil.

5. Uso adequado
Não é permitido usar o GlicoGuide para inserir dados de saúde de terceiros sem consentimento, nem tentar acessar contas de outros usuários.

6. Alterações
Podemos atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas no app.

7. Contato
Dúvidas sobre estes Termos podem ser enviadas para contato@glicoguide.app.`;

export default function LegalModal({ visible, tipo, onClose }: Props) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const texto = tipo === 'privacidade' ? PRIVACIDADE : TERMOS;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>{TITULOS[tipo]}</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={s.text}>{texto}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    title: { color: colors.white, fontSize: 18, fontWeight: '700', flex: 1 },
    closeBtn: { padding: 4 },
    body: { flex: 1, paddingHorizontal: 20 },
    text: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  });
}
