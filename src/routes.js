import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import Main from './pages/main';
import Detalhes from './pages/detalhes';
import { colors } from './styles';

const Stack = createStackNavigator();
const header = { headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } };
export default function Routes() {
  return <Stack.Navigator screenOptions={header}>
    <Stack.Screen name="login" component={Login} options={{ title: 'AniLater', headerLeft: () => null }} />
    <Stack.Screen name="cadastro" component={Cadastro} options={{ title: 'Cadastrar usuário' }} />
    <Stack.Screen name="main" component={Main} options={({ navigation }) => ({
      title: 'Meus animes', headerLeft: () => null,
      headerRight: () => <Ionicons name="log-out-outline" size={26} color="#fff" style={{ marginRight: 16 }} accessibilityLabel="Sair" onPress={async () => {
        await AsyncStorage.removeItem('sessao');
        navigation.replace('login');
      }} />,
    })} />
    <Stack.Screen name="detalhes" component={Detalhes} options={{ title: 'Detalhes do anime' }} />
  </Stack.Navigator>;
}
