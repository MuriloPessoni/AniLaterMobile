import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles';

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const entrar = async () => {
    if (loading) return;
    if (!usuario.trim() || !senha) return Alert.alert('Atenção', 'Informe usuário e senha.');
    setLoading(true);
    try {
      const salvo = await AsyncStorage.getItem('usuario');
      if (!salvo) return Alert.alert('Atenção', 'Cadastre um usuário primeiro.');
      const conta = JSON.parse(salvo);
      if (conta.email.toLowerCase() !== usuario.trim().toLowerCase() || conta.senha !== senha) {
        return Alert.alert('Atenção', 'Usuário ou senha inválidos.');
      }
      await AsyncStorage.setItem('sessao', conta.email);
      setSenha('');
      navigation.replace('main');
    } catch (error) { Alert.alert('Erro', 'Não foi possível acessar os dados locais.'); }
    finally { setLoading(false); }
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Seu catálogo de animes</Text>
      <Text style={styles.subtitle}>Entre com o e-mail e a senha cadastrados neste aparelho.</Text>
      <Text style={styles.label}>Usuário (e-mail)</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="Sua senha" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={entrar} disabled={loading}><Text style={styles.buttonText}>{loading ? 'ENTRANDO...' : 'ENTRAR'}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate('cadastro')}><Text style={[styles.buttonText, styles.secondaryText]}>CADASTRAR USUÁRIO</Text></TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}
