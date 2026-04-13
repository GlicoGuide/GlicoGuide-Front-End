# GlicoGuide — Documentação do Projeto

App mobile de gerenciamento de diabetes. Analisa fotos de refeições com IA (GPT-4o), estima carboidratos e calcula a dose de insulina bolus.

---

## O que foi implementado

### Infraestrutura
- [x] React Native 0.84.1 com New Architecture
- [x] TypeScript em todo o projeto
- [x] Sistema de tema claro/escuro (ThemeContext + makeStyles)
- [x] Contexto de autenticação JWT (AuthContext)
- [x] Serviço de API centralizado (`src/services/api.ts`)
- [x] Serviço de storage local (`src/services/storage.ts`) com AsyncStorage v2.1.2
- [x] Navegação por abas (5 abas) + stack dentro da aba Início
- [x] Ícones com MaterialCommunityIcons (sem emojis)
- [x] Ícone do app gerado a partir do logo SVG (Inkscape)
- [x] Nome do APK: "GlicoGuide"

### Telas

| Tela | Funcionalidades |
|------|----------------|
| **Login / Cadastro** | Tab toggle Entrar/Criar Conta, validação, integração real com API |
| **Home** | Dashboard com stats de glicemia, grid de ações, avatar navega ao Perfil |
| **Perfil** | Avatar, GlicoPoints (350), stats de glicemia real, toggle dark/light mode, signOut |
| **Dados** | Tela de registros e gráficos (visual pronto) |
| **Chat (Glico AI)** | Interface de chat, sem integração de IA ainda |
| **Análise de Prato** | Câmera, glicemia atual, **peso do prato (novo)**, análise com GPT-4o, resultado com carbos + insulina, salva no histórico |
| **Relatório Mensal** | Dados reais da API, navegação mês a mês, top alimentos, refeições com mais carbo |
| **Lembretes** | AsyncStorage, adicionar/deletar, toggle ativo/inativo, ordenado por horário |
| **Minhas Metas** | Metas fixas + metas customizadas (AsyncStorage), toggle concluída, deletar |
| **Diário** | CRUD completo, 5 níveis de humor com cores/ícones, editar tocando, deletar com pressão longa |
| **Contador de Carbo** | 2 abas: Contador (alimentos base + IA + manual, cálculo bolus) e Histórico (agrupado por dia, separado por IA/manual) |
| **Loja Glico** | Visual de gamificação (mock) |
| **Área Médica** | Stats clínicos e ações rápidas (mock) |

---

## O que falta fazer

### Prioritário (bloqueia produção)
- [ ] **Persistência de sessão** — token JWT fica em memória RAM, some ao fechar o app. Implementar com `react-native-keychain`
- [ ] **HTTPS** — backend precisa de TLS antes de produção (dados de saúde não podem trafegar em HTTP claro)
- [ ] **Keystore de produção** — hoje o release APK usa `debug.keystore`. Gerar uma keystore própria para publicar na Play Store

### Funcionalidades pendentes
- [ ] **Chat com IA** — endpoint de chat ainda não existe no backend
- [ ] **Notificações dos lembretes** — hoje são só alarmes visuais, sem push/local notification real
- [ ] **Rota backend peso_prato** — frontend já envia `peso_prato_g`, backend não processa ainda
- [ ] **Loja Glico** — sistema de GlicoPoints real (pontos por registros, metas cumpridas etc.)
- [ ] **Área Médica** — conectar com dados reais da API
- [ ] **Validação de e-mail** no formulário de login/cadastro

### Segurança (antes de publicar)
- [ ] AsyncStorage sem criptografia — usar `react-native-mmkv` com chave ou `Encrypted SharedPreferences`
- [ ] Limite de tentativas de login (proteção local contra força bruta)

---

## Pré-requisitos para rodar o projeto

### Ferramentas necessárias

| Ferramenta | Versão | Instalação |
|------------|--------|------------|
| Node.js | >= 22 | https://nodejs.org ou `nvm install 22` |
| JDK | 17 | https://adoptium.net |
| Android Studio | Ladybug+ | https://developer.android.com/studio |
| Xcode | 15+ *(só Mac)* | App Store |
| CocoaPods | >= 1.15 *(só Mac)* | `sudo gem install cocoapods` |
| Docker | qualquer | https://docs.docker.com/get-docker |
| ADB | via Android Studio | incluso no Platform-Tools do SDK |

### SDK Android necessário (via Android Studio → SDK Manager)
- Android SDK Platform 35
- Android SDK Build-Tools 35
- Android SDK Platform-Tools
- Android Emulator (se quiser emulador)

### Variáveis de ambiente — adicionar ao `~/.zshrc` ou `~/.bashrc`

**Linux:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

**Mac:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

Depois: `source ~/.zshrc`

---

## Como rodar o projeto

### 1. Clonar e instalar

```bash
git clone git@github.com:GlicoGuide/glicoguideapp.git
cd glicoguideapp
npm install
```

### 2. Criar o arquivo android/local.properties

```bash
# Linux
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties

# Mac
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### 3. Subir o backend

```bash
# Na pasta do backend (repositório separado)
git clone git@github.com:GlicoGuide/Back-End.git
cd Back-End
docker-compose up -d
docker-compose exec app flask --app app db upgrade
```

O backend ficará disponível em `http://localhost:5001`.

---

## Rodar no Android

### Opção A — Emulador (Android Studio)

1. Abra o Android Studio → Device Manager → crie um Pixel 8 API 35
2. Inicie o emulador
3. Em um terminal:
```bash
npm run android
```

O Metro e o build rodam juntos. A URL do backend no emulador é `http://10.0.2.2:5001` — troque em `src/services/api.ts` se estiver usando emulador.

### Opção B — Celular físico via USB (recomendado)

1. No celular: Configurações → Sobre o telefone → toque 7x em "Número da versão" → Opções do desenvolvedor → ative "Depuração USB"
2. Conecte o celular via USB e autorize o computador
3. Terminal 1 — redirecionar portas e iniciar Metro:
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5001 tcp:5001
npm start
```
4. Terminal 2 — fazer build e instalar:
```bash
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
5. Abra o app GlicoGuide no celular

> **Rebuild obrigatório** sempre que instalar nova dependência nativa, alterar AndroidManifest.xml ou trocar ícones. Para mudanças só em JS/TSX, o hot reload via Metro já funciona.

---

## Rodar no iOS (apenas Mac)

```bash
cd ios
pod install
cd ..
npm run ios
```

Para celular físico iOS:
1. Abra `ios/glicoguideapp.xcworkspace` no Xcode
2. Configure o Team de assinatura (sua Apple ID)
3. Conecte o iPhone, selecione como destino e clique em Run

---

## Como usar o app

### Primeiro acesso
1. Abra o app → tela de Login
2. Toque em **Criar Conta** → preencha nome, e-mail e senha (mín. 6 caracteres)
3. O app faz login automaticamente após o cadastro

### Análise de prato (funcionalidade principal)
1. Na Home, toque em **Análise de Prato** (ou aba Saúde)
2. Toque na área da câmera para fotografar sua refeição
3. Preencha sua **glicemia atual** (obrigatório)
4. Opcionalmente informe o **peso do prato em gramas**
5. Toque em **Analisar Refeição** — a IA detecta os alimentos e calcula a insulina
6. O resultado aparece abaixo com: alimentos detectados, carboidratos totais, insulina de refeição, insulina de correção e **insulina total**

### Contador de Carbo (manual)
1. Home → **Contador de Carbo**
2. Aba **Contador**: selecione alimentos da lista ou adicione manualmente com a porção em gramas
3. Os itens analisados pela IA na última sessão aparecem pré-selecionados
4. Ajuste o **ratio** (g de carbo por unidade de insulina) e toque em **Salvar no histórico**
5. Aba **Histórico**: veja sessões agrupadas por dia, expandindo para ver itens com origem IA ou manual

### Lembretes
- Toque no ícone de sino na Home → adicione lembretes de medicação ou medição
- Pressione longo para deletar um lembrete

### Diário
- Home → **Diário** → registre como está seu dia com texto e humor
- Toque numa entrada para editar; pressione longo para deletar

### Metas
- Home → **Minhas Metas** → toggle para marcar metas como concluídas
- Toque no **+** para criar metas personalizadas

### Relatório Mensal
- Home → **Relatório** → veja refeições agrupadas por mês com estatísticas
- Use as setas para navegar entre meses

### Perfil
- Toque no avatar no canto superior direito da Home
- Alterne entre modo claro e escuro
- Faça logout

---

## Estrutura de pastas

```
glicoguideapp/
├── android/                    → build Android
├── ios/                        → build iOS
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx     → autenticação (signIn, signUp, signOut, token)
│   │   └── ThemeContext.tsx    → tema claro/escuro
│   ├── navigation/
│   │   ├── AppNavigator.tsx    → Login → MainTabs
│   │   └── HomeStack.tsx       → stack das sub-telas da Home
│   ├── screens/                → uma tela por arquivo
│   ├── services/
│   │   ├── api.ts              → chamadas HTTP ao backend
│   │   └── storage.ts          → AsyncStorage (lembretes, diário, metas, histórico)
│   └── theme/
│       └── themes.ts           → darkTheme e lightTheme
├── PROJETO.md                  → este arquivo
└── SETUP.md                    → setup rápido em novo PC
```

---

## Comandos úteis

```bash
# Rodar no Android (emulador aberto)
npm run android

# Build APK debug manual
cd android && ./gradlew assembleDebug

# Instalar APK no celular
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Redirecionar portas para celular físico
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5001 tcp:5001

# Limpar cache do Metro
npm start -- --reset-cache

# Limpar build Android
cd android && ./gradlew clean

# Ver dispositivos conectados
adb devices

# Backend
docker-compose up -d        # subir
docker-compose down         # parar
docker-compose logs -f app  # ver logs
```
