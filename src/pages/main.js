import React, { useEffect, useRef, useState } from 'react';
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

const status = {
  FINISHED: 'Finalizado',
  RELEASING: 'Em lançamento',
  NOT_YET_RELEASED: 'Ainda não lançado',
  CANCELLED: 'Cancelado',
  HIATUS: 'Pausado',
};

const avisar = (titulo, mensagem) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

export default function Main({ navigation }) {
  const [busca, setBusca] = useState('');
  const [animes, setAnimes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [termoAtual, setTermoAtual] = useState('');
  const [chaveAnimes, setChaveAnimes] = useState('');

  // Impede duas alterações simultâneas na lista.
  const ocupado = useRef(false);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const sessao = await AsyncStorage.getItem('sessao');

        if (!ativo) return;

        if (!sessao) {
          navigation.replace('login');
          return;
        }

        const email = sessao.trim().toLowerCase();
        const chave = `animes:${email}`;

        let salvo = await AsyncStorage.getItem(chave);

        // A lista antiga só é transferida ao último cadastro antigo.
        if (salvo === null) {
          const antigoSalvo = await AsyncStorage.getItem('usuario');

          if (antigoSalvo) {
            const antigo = JSON.parse(antigoSalvo);
            const emailAntigo = antigo.email.trim().toLowerCase();

            if (emailAntigo === email) {
              const listaAntiga = await AsyncStorage.getItem('animes');

              if (listaAntiga !== null) {
                const lista = JSON.parse(listaAntiga);

                if (!Array.isArray(lista)) {
                  throw new Error('Lista antiga inválida.');
                }

                await AsyncStorage.setItem(
                  chave,
                  JSON.stringify(lista)
                );

                salvo = JSON.stringify(lista);
              }
            }
          }
        }

        const lista = salvo ? JSON.parse(salvo) : [];

        if (!Array.isArray(lista)) {
          throw new Error('Lista inválida.');
        }

        if (ativo) {
          setChaveAnimes(chave);
          setAnimes(lista);
          setPronto(true);
        }
      } catch (error) {
        if (ativo) {
          avisar('Erro', 'Não foi possível carregar os cards salvos.');
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [navigation]);

  const adicionar = async () => {
    if (ocupado.current || !pronto || !chaveAnimes) return;

    const termo = busca.trim();

    if (!termo) {
      avisar('Atenção', 'Digite o nome de um anime antes de tocar em ADD.');
      return;
    }

    ocupado.current = true;
    setCarregando(true);

    try {
      const mesmaBusca =
        termo.toLowerCase() === termoAtual.toLowerCase();

      let paginaConsulta = mesmaBusca ? pagina : 1;
      let candidato;
      let continua = true;

      // Busca um resultado que ainda não esteja nesta conta.
      while (!candidato && continua) {
        const resposta = await buscarAnimes(termo, paginaConsulta);

        candidato = resposta.media.find(
          item => !animes.some(salvo => salvo.id === item.id)
        );

        continua = resposta.pageInfo.hasNextPage;

        if (!candidato && continua) {
          paginaConsulta += 1;
        }
      }

      if (!candidato) {
        avisar(
          'Sem resultados',
          'Nenhum anime novo foi encontrado para essa busca.'
        );
        return;
      }

      const novos = [...animes, candidato];

      // Salva somente na lista do usuário conectado.
      await AsyncStorage.setItem(chaveAnimes, JSON.stringify(novos));

      setAnimes(novos);
      setTermoAtual(termo);
      setPagina(paginaConsulta);

      Keyboard.dismiss();
    } catch (error) {
      avisar('Erro na busca', mensagemErro(error));
    } finally {
      ocupado.current = false;
      setCarregando(false);
    }
  };

  const excluir = item => {
    if (ocupado.current || !pronto || !chaveAnimes) return;

    const remover = async () => {
      if (ocupado.current) return;

      ocupado.current = true;
      setCarregando(true);

      try {
        const novos = animes.filter(anime => anime.id !== item.id);

        await AsyncStorage.setItem(chaveAnimes, JSON.stringify(novos));

        setAnimes(novos);

        // Permite encontrar novamente um anime excluído.
        setPagina(1);
        setTermoAtual('');
      } catch (error) {
        avisar('Erro', 'Não foi possível excluir o card.');
      } finally {
        ocupado.current = false;
        setCarregando(false);
      }
    };

    const titulo = item.title.english || item.title.romaji;
    const mensagem = `Remover ${titulo}?`;

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

  const topo = (
    <View style={styles.content}>
      <Text style={styles.title}>Descubra animes</Text>
      <Text style={styles.subtitle}>
        Busque um título e toque em ADD para adicionar um anime por vez.
        Toque novamente para buscar o próximo.
      </Text>

      <Text style={styles.label}>Nome do anime</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Naruto"
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
        onSubmitEditing={adicionar}
      />

      <TouchableOpacity
        style={styles.button}
        disabled={carregando || !pronto}
        onPress={adicionar}
      >
        {carregando || !pronto ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ADD</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 10 }]}>
        Seus cards ({animes.length})
      </Text>

      {pronto && animes.length === 0 && (
        <Text style={styles.subtitle}>
          Nenhum card ainda. Pesquise um anime acima.
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      style={[styles.screen, { flexBasis: 0, minHeight: 0 }]}
      showsVerticalScrollIndicator={true}
      data={animes}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={topo}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <View style={[styles.card, { marginHorizontal: 20 }]}>
          <View style={styles.cardRow}>
            {item.coverImage?.large ? (
              <Image
                style={styles.cover}
                source={{ uri: item.coverImage.large }}
              />
            ) : (
              <View style={styles.cover} />
            )}

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                {item.title.english || item.title.romaji}
              </Text>
              <Text style={styles.meta}>
                Status: {status[item.status] || 'Não informado'}
              </Text>
              <Text style={styles.meta}>
                Formato: {item.format || 'Não informado'}
              </Text>
              <Text style={styles.meta}>
                Episódios: {item.episodes ?? 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                navigation.navigate('detalhes', { anime: item })
              }
            >
              <Text style={styles.smallText}>VER MAIS DETALHES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.smallButton,
                {
                  backgroundColor: '#ffebec',
                  flex: 0,
                  paddingHorizontal: 16,
                },
              ]}
              onPress={() => excluir(item)}
              disabled={carregando || !pronto}
            >
              <Text style={[styles.smallText, { color: colors.danger }]}>
                EXCLUIR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}