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

export default function Cadastro({ navigation }) {
  const [dados, setDados] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    email: '',
    curso: '',
    senha: '',
  });
  const [saving, setSaving] = useState(false);

  const mudar = (campo, valor) => {
    setDados(atual => ({ ...atual, [campo]: valor }));
  };

  const salvar = async () => {
    if (saving) return;

    if (Object.values(dados).some(valor => !valor.trim())) {
      avisar('Atenção', 'Preencha todos os campos.');
      return;
    }

    const email = dados.email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      avisar('Atenção', 'Informe um e-mail válido.');
      return;
    }

    setSaving(true);

    try {
      const salvo = await AsyncStorage.getItem('usuarios');
      const usuarios = salvo ? JSON.parse(salvo) : [];

      // Recupera o último cadastro da versão anterior.
      const antigoSalvo = await AsyncStorage.getItem('usuario');

      if (antigoSalvo) {
        const antigo = JSON.parse(antigoSalvo);
        const emailAntigo = antigo.email.trim().toLowerCase();

        if (!usuarios.some(conta => conta.email === emailAntigo)) {
          usuarios.push({ ...antigo, email: emailAntigo });
        }
      }

      const jaExiste = usuarios.some(conta => conta.email === email);

      if (jaExiste) {
        // Também preserva o cadastro antigo na nova lista.
        await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
        avisar('Atenção', 'Este e-mail já está cadastrado. Faça login.');
        return;
      }

      const novaConta = { ...dados, email };
      const novosUsuarios = [...usuarios, novaConta];

      await AsyncStorage.setItem(
        'usuarios',
        JSON.stringify(novosUsuarios)
      );

      avisar('Pronto', 'Cadastro salvo neste aparelho. Agora faça login.');
      navigation.replace('login');
    } catch (error) {
      avisar('Erro', 'Não foi possível salvar o cadastro.');
    } finally {
      setSaving(false);
    }
  };

  const campos = [
    ['nome', 'Nome completo', 'default'],
    ['telefone', 'Telefone', 'phone-pad'],
    ['cpf', 'CPF', 'numeric'],
    ['email', 'E-mail (usuário)', 'email-address'],
    ['curso', 'Curso', 'default'],
  ];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Criar cadastro</Text>
        <Text style={styles.subtitle}>
          O e-mail será seu usuário no login. Crie também uma senha.
        </Text>

        {campos.map(([campo, titulo, teclado]) => (
          <React.Fragment key={campo}>
            <Text style={styles.label}>{titulo}</Text>
            <TextInput
              style={styles.input}
              value={dados[campo]}
              onChangeText={valor => mudar(campo, valor)}
              placeholder={titulo}
              keyboardType={teclado}
              autoCapitalize={campo === 'email' ? 'none' : 'sentences'}
              autoCorrect={campo !== 'email'}
              maxLength={campo === 'cpf' ? 14 : undefined}
            />
          </React.Fragment>
        ))}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={dados.senha}
          onChangeText={valor => mudar('senha', valor)}
          placeholder="Crie uma senha"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={salvar}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'SALVANDO...' : 'SALVAR'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}