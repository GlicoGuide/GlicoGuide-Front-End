# GlicoGuide — Documentação do Projeto

App mobile para gerenciamento de diabetes. Analisa fotos de refeições com IA (GPT-4o), estima carboidratos e calcula a dose de insulina bolus.

Construído com React Native 0.84.1 + TypeScript.

---

## Status de Implementação

### Infraestrutura
- [x] React Native 0.84.1 com New Architecture
- [x] TypeScript em todo o projeto
- [x] Sistema de tema claro/escuro (ThemeContext + makeStyles)
- [x] Contexto de autenticação com access + refresh token (AuthContext)
- [x] Sessão persistida com segurança no `react-native-keychain` (sobrevive a fechar o app)
- [x] Serviço de API centralizado (`src/services/api.ts`) com URLs separadas para dev/prod e renovação automática de token em 401
- [x] Storage local (`src/services/storage.ts`) cifrado com AES (`secureStorage.ts` + `crypto-js`, chave no Keychain)
- [x] Notificações locais reais para lembretes (`@notifee/react-native`)
- [x] Navegação por abas (5 abas) + stack dentro da aba Início
- [x] Ícones com MaterialCommunityIcons
- [x] Ícone do app gerado a partir do logo
- [x] SafeAreaView em todas as telas (compatível com Dynamic Island e notch)
- [x] Nome do app: "GlicoGuide" | Bundle ID: `com.willianarruda.glicoguide`
- [x] Testes automatizados (Jest) e CI (GitHub Actions)

### Telas

| Tela | Status | Observação |
|------|--------|-----------|
| Login / Cadastro | ✅ Completo | Integração real com API + checkbox de consentimento LGPD |
| Home | ✅ Completo | Dashboard com stats de glicemia + banner de alerta clínico |
| Perfil | ✅ Completo | GlicoPoints real, política/termos, exportar dados, excluir conta |
| Dados | ✅ Completo | Gráfico glicemia 7 dias, alerta clínico por medição, dados reais da API |
| Chat (Glico AI) | ✅ Completo | Integrado com `/api/chat/mensagem` |
| Análise de Prato | ✅ Completo | Câmera + GPT-4o + cálculo de bolus |
| Relatório Mensal | ✅ Completo | Dados reais, navegação mês a mês |
| Lembretes | ✅ Completo | Notificação local real agendada por lembrete ativo |
| Minhas Metas | ✅ Completo | Metas fixas + customizadas, credita GlicoPoints ao concluir |
| Diário | ✅ Completo | CRUD + 5 níveis de humor |
| Contador de Carbo | ✅ Completo | Manual + IA + histórico por dia |
| Loja Glico | ✅ Completo | Saldo real de GlicoPoints, recompensas com estado desbloqueado/bloqueado |
| Área Médica | ✅ Completo | Estatísticas reais via `/api/medico/resumo`, incluindo HbA1c estimada |

---

## Roadmap (pendências)

Praticamente tudo que bloqueava produção do lado de código já foi resolvido. O que resta é principalmente configuração de ambiente/infra:

### Bloqueia produção
- [ ] **HTTPS** — backend ainda serve em HTTP puro; Railway provê TLS automaticamente, falta configurar/verificar no deploy
- [ ] **Deploy do backend** — subir de fato no Railway e trocar `PROD_URL` em `src/services/api.ts`
- [ ] **Keystore de produção** — APK ainda usa `debug.keystore` → gerar keystore real para a Play Store

### Hardening adicional (não bloqueia, mas vale antes de escalar)
- [ ] **Rate limit distribuído** — o bloqueio de login hoje é por contador na própria linha do usuário no banco; funciona bem para um único processo, mas não tem proteção extra por IP
- [ ] **Retenção/expiração de dados** — política de privacidade descreve retenção, mas não há job automático de expiração/anonimização
- [ ] **Canal de contato do titular (DPO)** — hoje só existe o e-mail citado na política; não há uma tela dedicada de "fale conosco" sobre dados
- [ ] **Testes de UI/E2E** — a cobertura atual é unitária (Jest/pytest); não há Detox/Maestro ainda

---

## Estrutura de Pastas

```
glicoguideapp/
├── android/                    → build Android nativo
├── ios/                        → build iOS nativo
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx     → autenticação (signIn, signUp, signOut, access + refresh token)
│   │   └── ThemeContext.tsx    → tema claro/escuro
│   ├── navigation/
│   │   ├── AppNavigator.tsx    → raiz: sem auth → Login, com auth → MainTabs
│   │   └── HomeStack.tsx       → stack das sub-telas da Home
│   ├── screens/                → 13 telas (uma por arquivo)
│   ├── components/
│   │   └── LegalModal.tsx      → política de privacidade e termos de uso
│   ├── services/
│   │   ├── api.ts              → cliente HTTP (DEV/PROD URLs, funções tipadas, renovação de token)
│   │   ├── storage.ts          → dados locais (lembretes, diário, metas, histórico) — cifrados
│   │   ├── secureStorage.ts    → criptografia AES por cima do AsyncStorage
│   │   └── notifications.ts    → agendamento das notificações locais dos lembretes
│   ├── utils/
│   │   └── alerta.ts           → estilo por nível de alerta de glicemia
│   └── theme/
│       └── themes.ts           → darkTheme e lightTheme
├── __tests__/, jest.config.js, jest.setup.js → testes (Jest)
├── README.md                   → visão geral e comandos rápidos
├── PROJETO.md                  → este arquivo (status e roadmap)
├── BACKEND.md                  → referência do backend do ponto de vista do app
├── LGPD.md                     → conformidade com a LGPD
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
LoginScreen (checkbox de consentimento marcado)
    ↓ signIn(email, password) / signUp(name, email, password, consentimento)
AuthContext → apiLogin()/apiRegister() → POST /api/auth/login ou /register
    ↓ access token + refresh token retornados
Keychain.setGenericPassword() → sessão persistida no dispositivo
    ↓
AppNavigator detecta token → navega para MainTabs
```

Sessão sobrevive a fechar o app: no próximo lançamento, `AuthContext` lê o Keychain antes de decidir entre `LoginScreen` e `MainTabs`.

**Renovação automática:** cada chamada de `api.ts` que recebe `401` tenta renovar o access token com o refresh token (`POST /api/auth/refresh`) e refaz a requisição uma vez. Se o refresh também falhar, `onUnauthorized` dispara `signOut()` e o usuário volta pro Login.

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
