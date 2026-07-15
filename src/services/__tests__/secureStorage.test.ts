import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, setSecureItem } from '../secureStorage';

describe('secureStorage', () => {
  it('recupera exatamente o valor salvo', async () => {
    await setSecureItem('@teste:chave', JSON.stringify({ ola: 'mundo' }));
    const raw = await getSecureItem('@teste:chave');
    expect(JSON.parse(raw as string)).toEqual({ ola: 'mundo' });
  });

  it('não guarda o valor em texto plano no AsyncStorage', async () => {
    await setSecureItem('@teste:sensivel', JSON.stringify({ segredo: 'dado-de-saude' }));
    const raw = await AsyncStorage.getItem('@teste:sensivel');
    expect(raw).not.toContain('dado-de-saude');
  });

  it('retorna null quando a chave não existe', async () => {
    const valor = await getSecureItem('@teste:inexistente');
    expect(valor).toBeNull();
  });
});
