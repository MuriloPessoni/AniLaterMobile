import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles';

const avisar = (titulo, mensagem) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    if (loading) return;

    const email = usuario.trim().toLowerCase();

    if (!email || !senha) {
      avisar('Atenção', 'Informe usuário e senha.');
      return;
    }

    setLoading(true);

    try {
      const salvo = await AsyncStorage.getItem('usuarios');
      const usuarios = salvo ? JSON.parse(salvo) : [];

      // Inclui o último usuário da versão anterior, se necessário.
      const antigoSalvo = await AsyncStorage.getItem('usuario');

      if (antigoSalvo) {
        const antigo = JSON.parse(antigoSalvo);
        const emailAntigo = antigo.email.trim().toLowerCase();

        if (!usuarios.some(conta => conta.email === emailAntigo)) {
          usuarios.push({ ...antigo, email: emailAntigo });

          await AsyncStorage.setItem(
            'usuarios',
            JSON.stringify(usuarios)
          );
        }
      }

      if (usuarios.length === 0) {
        avisar('Atenção', 'Cadastre um usuário primeiro.');
        return;
      }

      // Procura a conta correspondente ao e-mail informado.
      const conta = usuarios.find(item => item.email === email);

      if (!conta || conta.senha !== senha) {
        avisar('Atenção', 'Usuário ou senha inválidos.');
        return;
      }

      await AsyncStorage.setItem('sessao', conta.email);

        avisar('Teste', 'Login validado. Vou abrir a tela principal.');

        setSenha('');
        navigation.replace('main');
    } catch (error) {
      avisar('Erro', 'Não foi possível acessar os dados locais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { flexGrow: 1, justifyContent: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Seu catálogo de animes</Text>
        <Text style={styles.subtitle}>
          Entre com o e-mail e a senha cadastrados neste aparelho.
        </Text>

        <Text style={styles.label}>Usuário (e-mail)</Text>
        <TextInput
          style={styles.input}
          value={usuario}
          onChangeText={setUsuario}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={entrar}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('cadastro')}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>
            CADASTRAR USUÁRIO
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}