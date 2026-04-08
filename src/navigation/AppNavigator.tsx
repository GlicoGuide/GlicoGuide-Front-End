import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeStack from './HomeStack';
import ChatScreen from '../screens/ChatScreen';
import DadosScreen from '../screens/DadosScreen';
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
        tabBarLabelStyle: { fontSize: 11, marginTop: -4 },
        tabBarIcon: ({ color }) => {
          const icons: Record<string, string> = {
            'Início': 'home-outline',
            'Dados': 'chart-bar',
            'Chat': 'message-outline',
            'Saúde': 'heart-pulse',
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={24} color={color} />;
        },
      })}>
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Dados" component={DadosScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Saúde" component={AreaMedicaScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
