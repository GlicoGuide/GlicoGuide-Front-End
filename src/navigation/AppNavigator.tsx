import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeStack from './HomeStack';
import ChatScreen from '../screens/ChatScreen';
import AreaMedicaScreen from '../screens/AreaMedicaScreen';
import colors from '../theme/colors';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type TabParamList = {
  Início: undefined;
  Dados: undefined;
  Chat: undefined;
  Saúde: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function DadosPlaceholder() {
  return null;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontSize: 11, marginTop: -4 }}>{route.name}</Text>
        ),
        tabBarIcon: ({ color }) => {
          const icons: Record<string, string> = {
            'Início': '🏠',
            'Dados': '📊',
            'Chat': '💬',
            'Saúde': '❤️',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}>
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Dados" component={DadosPlaceholder} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Saúde" component={AreaMedicaScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
