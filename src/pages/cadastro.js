import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles';

export default function Cadastro({ navigation }) {
  const [dados, setDados] = useState({ nome: '', telefone: '', cpf: '', email: '', curso: '', senha: '' });
  const [saving, setSaving] = useState(false);
  const mudar = (campo, valor) => setDados(atual => ({ ...atual, [campo]: valor }));
  const salvar = async () => {
    if (saving) return;
    if (Object.values(dados).some(valor => !valor.trim())) return Alert.alert('Atenção', 'Preencha todos os campos.');
    if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) return Alert.alert('Atenção', 'Informe um e-mail válido.');
    setSaving(true);
    try {
      await AsyncStorage.setItem('usuario', JSON.stringify({ ...dados, email: dados.email.trim().toLowerCase() }));
      Alert.alert('Pronto', 'Cadastro salvo neste aparelho. Agora faça login.');
      navigation.replace('login');
    } catch (error) { Alert.alert('Erro', 'Não foi possível salvar o cadastro.'); }
    finally { setSaving(false); }
  };
  const campos = [
    ['nome', 'Nome completo', 'default'], ['telefone', 'Telefone', 'phone-pad'],
    ['cpf', 'CPF', 'numeric'], ['email', 'E-mail (usuário)', 'email-address'], ['curso', 'Curso', 'default'],
  ];
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Criar cadastro</Text>
      <Text style={styles.subtitle}>O e-mail será seu usuário no login. Crie também uma senha.</Text>
      {campos.map(([campo, titulo, teclado]) => <React.Fragment key={campo}>
        <Text style={styles.label}>{titulo}</Text>
        <TextInput style={styles.input} value={dados[campo]} onChangeText={valor => mudar(campo, valor)} placeholder={titulo} keyboardType={teclado} autoCapitalize={campo === 'email' ? 'none' : 'sentences'} maxLength={campo === 'cpf' ? 14 : undefined} />
      </React.Fragment>)}
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} value={dados.senha} onChangeText={valor => mudar('senha', valor)} placeholder="Crie uma senha" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={salvar} disabled={saving}><Text style={styles.buttonText}>{saving ? 'SALVANDO...' : 'SALVAR'}</Text></TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}
