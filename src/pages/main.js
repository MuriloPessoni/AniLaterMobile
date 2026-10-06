import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarAnimes, mensagemErro } from '../services/api';
import { styles, colors } from '../styles';

const status = { FINISHED: 'Finalizado', RELEASING: 'Em lançamento', NOT_YET_RELEASED: 'Ainda não lançado', CANCELLED: 'Cancelado', HIATUS: 'Pausado' };
export default function Main({ navigation }) {
  const [busca, setBusca] = useState('');
  const [animes, setAnimes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [termoAtual, setTermoAtual] = useState('');
  const [temMais, setTemMais] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('animes').then(valor => {
      if (valor) setAnimes(JSON.parse(valor));
    }).catch(() => Alert.alert('Erro', 'Não foi possível carregar os cards salvos.')).finally(() => setPronto(true));
  }, []);

  const adicionar = async () => {
    const termo = busca.trim();
    if (carregando || !pronto) return;
    if (!termo) return Alert.alert('Atenção', 'Digite o nome de um anime antes de tocar em ADD.');
    const mesmaBusca = termo.toLowerCase() === termoAtual.toLowerCase();
    if (mesmaBusca && !temMais) return Alert.alert('Fim da busca', 'Não há mais resultados para esse nome.');
    setCarregando(true);
    try {
      let paginaConsulta = mesmaBusca ? pagina : 1;
      let candidato;
      let continua = true;
      while (!candidato && continua) {
        const resposta = await buscarAnimes(termo, paginaConsulta);
        candidato = resposta.media.find(item => !animes.some(salvo => salvo.id === item.id));
        continua = resposta.pageInfo.hasNextPage;
        if (!candidato && continua) paginaConsulta += 1;
        else if (candidato && resposta.media.indexOf(candidato) === resposta.media.length - 1 && continua) paginaConsulta += 1;
      }
      setTermoAtual(termo);
      setPagina(paginaConsulta);
      setTemMais(continua);
      if (!candidato) return Alert.alert('Sem resultados', 'Nenhum anime novo foi encontrado para essa busca.');
      const novos = [...animes, candidato];
      await AsyncStorage.setItem('animes', JSON.stringify(novos));
      setAnimes(novos);
      Keyboard.dismiss();
    } catch (error) { Alert.alert('Erro na busca', mensagemErro(error)); }
    finally { setCarregando(false); }
  };

  const excluir = (item) => {
    const remover = async () => {
      const novos = animes.filter(anime => anime.id !== item.id);

      try {
        await AsyncStorage.setItem('animes', JSON.stringify(novos));
        setAnimes(novos);
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Não foi possível excluir o card.');
        } else {
          Alert.alert('Erro', 'Não foi possível excluir o card.');
        }
      }
    };

    const mensagem = `Remover ${item.title.english || item.title.romaji}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) {
        remover();
      }
    } else {
      Alert.alert('Excluir card', mensagem, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: remover },
      ]);
    }
  };

  const topo = <View style={styles.content}>
    <Text style={styles.title}>Descubra animes</Text>
    <Text style={styles.subtitle}>Busque um título e toque em ADD para adicionar um anime por vez. Toque novamente para buscar o próximo.</Text>
    <Text style={styles.label}>Nome do anime</Text>
    <TextInput style={styles.input} placeholder="Ex.: Naruto" value={busca} onChangeText={setBusca} returnKeyType="search" onSubmitEditing={adicionar} />
    <TouchableOpacity style={styles.button} disabled={carregando || !pronto} onPress={adicionar}>
      {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADD</Text>}
    </TouchableOpacity>
    <Text style={[styles.label, { marginTop: 10 }]}>Seus cards ({animes.length})</Text>
    {animes.length === 0 && <Text style={styles.subtitle}>Nenhum card ainda. Pesquise um anime acima.</Text>}
  </View>;

  return <FlatList style={[styles.screen, { flexBasis: 0, minHeight: 0 }]} showsVerticalScrollIndicator={true} data={animes} keyExtractor={item => String(item.id)} ListHeaderComponent={topo} contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled" renderItem={({ item }) => <View style={[styles.card, { marginHorizontal: 20 }]}>
    <View style={styles.cardRow}>
      {item.coverImage?.large ? <Image style={styles.cover} source={{ uri: item.coverImage.large }} /> : <View style={styles.cover} />}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title.english || item.title.romaji}</Text>
        <Text style={styles.meta}>Status: {status[item.status] || 'Não informado'}</Text>
        <Text style={styles.meta}>Formato: {item.format || 'Não informado'}</Text>
        <Text style={styles.meta}>Episódios: {item.episodes ?? 'Não informado'}</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('detalhes', { anime: item })}><Text style={styles.smallText}>VER MAIS DETALHES</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#ffebec', flex: 0, paddingHorizontal: 16 }]} onPress={() => excluir(item)}><Text style={[styles.smallText, { color: colors.danger }]}>EXCLUIR</Text></TouchableOpacity>
    </View>
  </View>} />;
}
