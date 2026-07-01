# GlicoGuide

App mobile para gerenciamento de diabetes. Analisa fotos de refeições com IA (GPT-4o), estima carboidratos e calcula a dose de insulina bolus.

Construído com React Native 0.84 + TypeScript.

---

## Pré-requisitos

| Ferramenta | Versão | Instalação |
|---|---|---|
| Node.js | >= 22.11.0 | https://nodejs.org ou `nvm install 22` |
| JDK | 17 | https://adoptium.net |
| Android Studio | Ladybug+ | https://developer.android.com/studio |
| Xcode | 15+ *(só Mac)* | App Store |
| CocoaPods | >= 1.15 *(só Mac)* | `sudo gem install cocoapods` |
| Docker | qualquer | https://docs.docker.com/get-docker |

---

## Instalação

```bash
git clone git@github.com:WillianAsouz4/glicoguideapp.git
cd glicoguideapp
npm install
```

---

## Subir o backend

```bash
# Na pasta do backend (repositório separado)
docker-compose up -d
```

O backend roda em `http://localhost:5001`.

---

## Rodar o app

### iOS — Simulador
```bash
cd ios && pod install && cd ..
npm run ios
```

### iOS — Dispositivo físico
1. Ative o **Acesso Pessoal** no iPhone
2. Conecte o Mac ao Wi-Fi do iPhone
3. Descubra o IP do Mac: `ipconfig getifaddr en0`
4. Atualize `src/services/api.ts` com o IP encontrado
5. Em um terminal: `npm start`
6. Em outro terminal: `npm run ios -- --device`

### Android — Emulador
```bash
npm run android
```

### Android — Dispositivo físico via USB
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5001 tcp:5001
npm start
# Em outro terminal:
npm run android
```

---

## Comandos úteis

```bash
npm start                        # Metro bundler
npm start -- --reset-cache       # Metro com cache limpo
npm run ios                      # iOS simulador
npm run ios -- --device          # iOS dispositivo físico
npm run android                  # Android
```

---

## Documentação completa

- [`PROJETO.md`](./PROJETO.md) — telas, funcionalidades, arquitetura e roadmap
- [`SETUP.md`](./SETUP.md) — setup detalhado em novo PC
- [`BACKEND.md`](./BACKEND.md) — tarefas pendentes do backend
