import axios from 'axios';

const api = axios.create({ baseURL: 'https://graphql.anilist.co', timeout: 12000 });

const mediaFields = `
  id
  title { romaji english native }
  coverImage { large }
  status
  format
  episodes
  averageScore
  genres
  seasonYear
  description(asHtml: false)
`;

export async function buscarAnimes(nome, pagina = 1) {
  const query = `query ($search: String!, $page: Int!) {
    Page(page: $page, perPage: 10) {
      pageInfo { hasNextPage }
      media(search: $search, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${mediaFields}
      }
    }
  }`;
  const response = await api.post('', { query, variables: { search: nome, page: pagina } });
  if (response.data.errors?.length) throw new Error(response.data.errors[0].message);
  return response.data.data.Page;
}

export function mensagemErro(error) {
  if (error.response?.status === 429) return 'Muitas consultas à AniList. Espere um minuto e tente novamente.';
  if (error.response?.data?.errors?.[0]?.message) return error.response.data.errors[0].message;
  return 'Não foi possível consultar a AniList. Verifique sua internet e tente novamente.';
}
