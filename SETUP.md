# GlicoGuide — Setup em novo PC

## Requisitos

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| Node.js | >= 22.11.0 | https://nodejs.org (LTS) ou `nvm install 22` |
| npm | >= 10 | Vem com o Node |
| Java JDK | 17 | `brew install openjdk@17` (Mac) ou [Adoptium](https://adoptium.net) |
| Android Studio | Ladybug ou mais recente | https://developer.android.com/studio |
| Xcode | 15+ (só Mac) | App Store |
| CocoaPods | >= 1.15 (só Mac) | `sudo gem install cocoapods` |
| Watchman | qualquer | `brew install watchman` (recomendado no Mac) |
| Docker | qualquer | https://docs.docker.com/get-docker |

---

## 1. Clonar o repositório

```bash
git clone git@github.com:WillianAsouz4/glicoguideapp.git
cd glicoguideapp
```

> Certifique-se de ter sua chave SSH adicionada ao GitHub antes de clonar.
> Se não tiver: `ssh-keygen -t ed25519 -C "seu@email.com"` e adicione em GitHub → Settings → SSH Keys.

---

## 2. Instalar dependências JavaScript

```bash
npm install
```

---

## 3. Setup Android

### 3.1 Variáveis de ambiente

Adicione ao `~/.zshrc` (Mac) ou `~/.bashrc` (Linux):

```bash
# Mac
export ANDROID_HOME=$HOME/Library/Android/sdk
# Linux
# export ANDROID_HOME=$HOME/Android/Sdk

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Recarregue: `source ~/.zshrc`

### 3.2 SDK necessário

No Android Studio → SDK Manager, instale:
- Android SDK Platform 35
- Android SDK Build-Tools 35
- Android SDK Platform-Tools
- Android Emulator

### 3.3 Criar emulador (opcional)

Android Studio → Device Manager → Create Virtual Device → Pixel 8, API 35.

### 3.4 Arquivo local.properties

```bash
# Mac
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Linux
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
```

### 3.5 Rodar no Android

```bash
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

> Se der erro no `pod install`:
> ```bash
> sudo gem install cocoapods
> pod repo update
> pod install
> ```

### iOS — Dispositivo físico

**Opção A — Hotspot do iPhone (recomendada):**

1. iPhone: **Ajustes → Acesso Pessoal → Ativar**
2. Mac: conectar ao Wi-Fi do iPhone
3. Descobrir IP do Mac: `ipconfig getifaddr en0`
4. Atualizar `DEV_URL` em `src/services/api.ts` com esse IP
5. Terminal 1: `npm start`
6. Terminal 2: `npm run ios -- --device` (iPhone desbloqueado)

**Opção B — Mesma rede Wi-Fi:**

1. `ipconfig getifaddr en0` → copiar o IP
2. Atualizar `DEV_URL` em `src/services/api.ts`
3. Terminal 1: `npm start`
4. Terminal 2: `npm run ios -- --device`
5. Se o app pedir endereço do Metro: usar o IP acima, porta `8081`

> **Nota:** `localhost` só funciona no simulador. No dispositivo físico sempre use o IP real do Mac.

---

## 5. Subir o backend

```bash
# Na pasta do backend (repositório separado)
docker-compose up -d
```

O backend ficará disponível em `http://localhost:5001`.

---

## 6. Resumo rápido

```bash
git clone git@github.com:WillianAsouz4/glicoguideapp.git
cd glicoguideapp
npm install

# iOS (simulador)
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

---

## Problemas comuns

**`SDK location not found`**
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

**`React Native version mismatch`**
```bash
npm install
npm start -- --reset-cache
```

**`Pods not installed`**
```bash
cd ios && pod install
```

**Porta 8081 ocupada**
```bash
kill -9 $(lsof -ti:8081)
npm start
```

**App não conecta ao Metro no dispositivo físico**
- Verifique se Mac e iPhone estão na mesma rede
- Em redes corporativas com firewall, use o hotspot do iPhone (Opção A acima)
- O IP do Mac muda conforme a rede — sempre rode `ipconfig getifaddr en0` para confirmar

**`Unable to launch app because device was not unlocked`**
- Mantenha o iPhone desbloqueado durante todo o processo de build e instalação
