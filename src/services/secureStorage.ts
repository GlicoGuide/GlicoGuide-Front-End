import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

const KEYCHAIN_SERVICE = 'glicoguide_storage_key';

// mantém em memória pra não ficar batendo no Keychain a cada leitura/escrita
let cachedKey: string | null = null;

// a chave só é gerada na primeira vez que algo é salvo/lido; depois disso
// fica presa no Keychain do aparelho (não sobe pro backend, não sai daqui)
async function getOrCreateKey(): Promise<string> {
  if (cachedKey) return cachedKey;

  const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (credentials) {
    cachedKey = credentials.password;
    return cachedKey;
  }

  const novaChave = CryptoJS.lib.WordArray.random(32).toString();
  await Keychain.setGenericPassword('glicoguide', novaChave, { service: KEYCHAIN_SERVICE });
  cachedKey = novaChave;
  return novaChave;
}

export async function getSecureItem(key: string): Promise<string | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    const chave = await getOrCreateKey();
    const decriptado = CryptoJS.AES.decrypt(raw, chave).toString(CryptoJS.enc.Utf8);
    return decriptado || null;
  } catch {
    // chave mudou ou dado corrompido — melhor tratar como "não tem nada"
    // do que derrubar a tela
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  const chave = await getOrCreateKey();
  const criptografado = CryptoJS.AES.encrypt(value, chave).toString();
  await AsyncStorage.setItem(key, criptografado);
}
