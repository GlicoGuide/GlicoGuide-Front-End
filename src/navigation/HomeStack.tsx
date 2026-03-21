import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RelatorioMensalScreen from '../screens/RelatorioMensalScreen';
import LembretesScreen from '../screens/LembretesScreen';
import MinhasMetasScreen from '../screens/MinhasMetasScreen';
import LojaGlicoScreen from '../screens/LojaGlicoScreen';
import AnaliseDePratoScreen from '../screens/AnaliseDePratoScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  RelatorioMensal: undefined;
  Lembretes: undefined;
  MinhasMetas: undefined;
  LojaGlico: undefined;
  AnaliseDePrato: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="RelatorioMensal" component={RelatorioMensalScreen} />
      <Stack.Screen name="Lembretes" component={LembretesScreen} />
      <Stack.Screen name="MinhasMetas" component={MinhasMetasScreen} />
      <Stack.Screen name="LojaGlico" component={LojaGlicoScreen} />
      <Stack.Screen name="AnaliseDePrato" component={AnaliseDePratoScreen} />
    </Stack.Navigator>
  );
}
