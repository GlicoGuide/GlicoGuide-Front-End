# GlicoGuide — Documentação do Projeto

App mobile para gerenciamento de diabetes. Analisa fotos de refeições com IA (GPT-4o), estima carboidratos e calcula a dose de insulina bolus.

Construído com React Native 0.84.1 + TypeScript.

---

## Status de Implementação

### Infraestrutura
- [x] React Native 0.84.1 com New Architecture
- [x] TypeScript em todo o projeto
- [x] Sistema de tema claro/escuro (ThemeContext + makeStyles)
- [x] Contexto de autenticação JWT (AuthContext)
- [x] Serviço de API centralizado (`src/services/api.ts`) com URLs separadas para dev e prod
- [x] Serviço de storage local (`src/services/storage.ts`) com AsyncStorage 2.1.2
- [x] Navegação por abas (5 abas) + stack dentro da aba Início
- [x] Ícones com MaterialCommunityIcons
- [x] Ícone do app gerado a partir do logo
- [x] SafeAreaView em todas as telas (compatível com Dynamic Island e notch)
- [x] Nome do app: "GlicoGuide" | Bundle ID: `com.willianarruda.glicoguide`

### Telas

| Tela | Status | Observação |
|------|--------|-----------|
| Login / Cadastro | ✅ Completo | Integração real com API |
| Home | ✅ Completo | Dashboard com stats de glicemia |
| Perfil | ⚠️ Parcial | GlicoPoints exibe valor fixo (backend pendente) |
| Dados | ✅ Completo | Gráfico glicemia 7 dias, dados reais da API |
| Chat (Glico AI) | ⚠️ Parcial | Interface pronta, integração com backend pendente |
| Análise de Prato | ✅ Completo | Câmera + GPT-4o + cálculo de bolus |
| Relatório Mensal | ✅ Completo | Dados reais, navegação mês a mês |
| Lembretes | ⚠️ Parcial | AsyncStorage funcional, notificações reais pendentes |
| Minhas Metas | ✅ Completo | Metas fixas + customizadas com AsyncStorage |
| Diário | ✅ Completo | CRUD + 5 níveis de humor |
| Contador de Carbo | ✅ Completo | Manual + IA + histórico por dia |
| Loja Glico | ⏳ Mock | Aguarda sistema de GlicoPoints no backend |
| Área Médica | ⏳ Mock | Aguarda endpoint de estatísticas clínicas |

---

## Roadmap (pendências)

### Bloqueia produção
- [ ] **Persistência de sessão** — token JWT em memória RAM, some ao fechar o app → `react-native-keychain`
- [ ] **HTTPS** — backend precisa de TLS antes de publicar (dados de saúde)
- [ ] **Keystore de produção** — APK ainda usa `debug.keystore` → gerar para Play Store
- [ ] **URL de produção** — atualizar `PROD_URL` em `src/services/api.ts` após deploy

### Funcionalidades pendentes
- [ ] **Chat com IA** — backend criado, falta integrar no `ChatScreen`
- [ ] **Alertas de glicemia** — backend retorna campo `alerta`, falta exibir no `DadosScreen` e `HomeScreen`
- [ ] **GlicoPoints real** — backend com sistema de pontos, falta consumir no `ProfileScreen`
- [ ] **Área Médica** — falta endpoint de estatísticas clínicas e integração na tela
- [ ] **Notificações de lembretes** — falta implementar com `@notifee/react-native`
- [ ] **Validação de e-mail** — adicionar regex de validação no formulário de login/cadastro

### Segurança (antes de publicar)
- [ ] AsyncStorage sem criptografia → migrar para `react-native-mmkv` com chave
- [ ] Limite de tentativas de login no frontend

---

## Estrutura de Pastas

```
glicoguideapp/
├── android/                    → build Android nativo
├── ios/                        → build iOS nativo
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx     → autenticação (signIn, signUp, signOut, token JWT)
│   │   └── ThemeContext.tsx    → tema claro/escuro
│   ├── navigation/
│   │   ├── AppNavigator.tsx    → raiz: sem auth → Login, com auth → MainTabs
│   │   └── HomeStack.tsx       → stack das sub-telas da Home
│   ├── screens/                → 13 telas (uma por arquivo)
│   ├── services/
│   │   ├── api.ts              → cliente HTTP (DEV/PROD URLs, funções tipadas)
│   │   └── storage.ts          → AsyncStorage (lembretes, diário, metas, histórico)
│   └── theme/
│       └── themes.ts           → darkTheme e lightTheme
├── README.md                   → visão geral e comandos rápidos
├── PROJETO.md                  → este arquivo (status e roadmap)
├── BACKEND.md                  → tarefas pendentes do backend
└── SETUP.md                    → setup em novo computador
```

---

## Configuração da API

Arquivo: `src/services/api.ts`

```ts
const DEV_URL  = 'http://<IP_DO_MAC>:5001';   // atualizar conforme rede
const PROD_URL = 'https://...railway.app';     // atualizar após deploy
```

### IP do Mac por cenário

| Cenário | IP a usar | Como obter |
|---|---|---|
| iOS Simulador | `localhost` | — |
| iOS cabo (mesma rede) | IP local do Mac | `ipconfig getifaddr en0` |
| iOS cabo (rede corporativa) | IP do hotspot do iPhone | ativar Acesso Pessoal, `ipconfig getifaddr en0` |
| Android Emulador | `10.0.2.2` | fixo no emulador |
| Android USB | `localhost` (após `adb reverse`) | — |

---

## Fluxo de Autenticação

```
LoginScreen
    ↓ signIn(email, password)
AuthContext → apiLogin() → POST /api/auth/login
    ↓ token JWT retornado
setToken(jwt) → armazenado em memória (variável do módulo api.ts)
    ↓
AppNavigator detecta token → navega para MainTabs
```

> Token fica em memória RAM. Ao fechar o app o usuário precisa fazer login novamente.
> Solução pendente: `react-native-keychain` para persistência segura.

---

## Fluxo de Análise de Prato

```
AnaliseDePratoScreen
    ↓ usuário fotografa refeição + informa glicemia atual
analisarPrato(imagemUri, glicemiaAtual, pesoPrato?)
    ↓ POST /api/insulin/calcular (multipart/form-data)
Backend: GPT-4o analisa imagem → identifica alimentos → estima carboidratos
    ↓
Backend: calcula bolus de refeição + correção glicêmica
    ↓
Backend: salva Meal + MealItems no banco
    ↓
App exibe: alimentos detectados, carboidratos totais, dose de insulina
```
