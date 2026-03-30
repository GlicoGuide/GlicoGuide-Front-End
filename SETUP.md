# GlicoGuide App — Setup no novo PC

## Requisitos do Sistema

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| Node.js | >= 22.11.0 | https://nodejs.org (LTS) ou `nvm install 22` |
| npm | >= 10 | Vem com o Node |
| Java JDK | 17 | `brew install openjdk@17` (Mac) ou [Adoptium](https://adoptium.net) |
| Android Studio | Ladybug ou mais recente | https://developer.android.com/studio |
| Xcode | 15+ (só Mac) | App Store |
| CocoaPods | >= 1.15 (só Mac) | `sudo gem install cocoapods` |
| Watchman | qualquer | `brew install watchman` (recomendado no Mac) |

---

## 1. Clonar o repositório

```bash
git clone git@github.com:WillianAsouz4/glicoguideapp.git
cd glicoguideapp
```

> Certifique-se de ter sua chave SSH adicionada ao GitHub antes de clonar.
> Se não tiver: `ssh-keygen -t ed25519 -C "seu@email.com"` e adicione em GitHub > Settings > SSH Keys.

---

## 2. Instalar dependências JavaScript

```bash
npm install
```

---

## 3. Setup Android

### 3.1 Variáveis de ambiente

Adicione ao `~/.zshrc` (ou `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk          # Mac
# export ANDROID_HOME=$HOME/Android/Sdk               # Linux
export PATH=$PATH:$ANDROID_HOME/emulador
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Recarregue:
```bash
source ~/.zshrc
```

### 3.2 SDK necessário

No Android Studio, vá em **SDK Manager** e instale:
- Android SDK Platform 35 (Android 15)
- Android SDK Build-Tools 35
- Android Emulator
- Android SDK Platform-Tools

### 3.3 Criar emulador (opcional)

No Android Studio: **Device Manager > Create Virtual Device** — escolha Pixel 8, API 35.

### 3.4 Rodar no Android

```bash
# Com emulador aberto ou dispositivo conectado:
npm run android
```

---

## 4. Setup iOS (apenas Mac)

```bash
cd ios
pod install
cd ..
npm run ios
```

> Se der erro no `pod install`, tente:
> ```bash
> sudo gem install cocoapods
> pod repo update
> pod install
> ```

---

## 5. Iniciar o Metro Bundler (servidor JS)

Em um terminal separado:

```bash
npm start
```

---

## 6. Resumo dos comandos

```bash
git clone git@github.com:WillianAsouz4/glicoguideapp.git
cd glicoguideapp
npm install

# Android
npm run android

# iOS (Mac)
cd ios && pod install && cd ..
npm run ios
```

---

## Problemas comuns

**`SDK location not found`** — Crie o arquivo `android/local.properties`:
```
sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
```

**`React Native version mismatch`** — Rode `npm install` novamente e limpe o cache:
```bash
npm start -- --reset-cache
```

**`Pods not installed`** — Entre na pasta `ios/` e rode `pod install`.

**Porta 8081 ocupada** — Encerre o processo ou rode: `npm start -- --port 8082`
