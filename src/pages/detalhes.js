import React from 'react';
import { ScrollView, Text, Image, View } from 'react-native';
import { styles, colors } from '../styles';

const status = { FINISHED: 'Finalizado', RELEASING: 'Em lançamento', NOT_YET_RELEASED: 'Ainda não lançado', CANCELLED: 'Cancelado', HIATUS: 'Pausado' };
function Info({ nome, valor }) {
  return <Text style={[styles.meta, { marginBottom: 12 }]}><Text style={{ color: colors.ink, fontWeight: '800' }}>{nome}: </Text>{valor || 'Não informado'}</Text>;
}
export default function Detalhes({ route }) {
  const { anime } = route.params;
  const descricao = anime.description?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    {anime.coverImage?.large && <Image source={{ uri: anime.coverImage.large }} style={{ width: 190, height: 265, borderRadius: 14, alignSelf: 'center', marginBottom: 22 }} />}
    <Text style={styles.title}>{anime.title.english || anime.title.romaji}</Text>
    <View style={styles.card}>
      <Info nome="Título original" valor={anime.title.native} />
      <Info nome="Título romaji" valor={anime.title.romaji} />
      <Info nome="Status" valor={status[anime.status]} />
      <Info nome="Formato" valor={anime.format} />
      <Info nome="Episódios" valor={anime.episodes?.toString()} />
      <Info nome="Ano" valor={anime.seasonYear?.toString()} />
      <Info nome="Nota média" valor={anime.averageScore != null ? `${anime.averageScore}/100` : null} />
      <Info nome="Gêneros" valor={anime.genres?.join(', ')} />
    </View>
    <Text style={[styles.label, { fontSize: 20 }]}>Sinopse</Text>
    <Text style={[styles.meta, { lineHeight: 24 }]}>{descricao || 'Sinopse não disponível na AniList.'}</Text>
  </ScrollView>;
}
