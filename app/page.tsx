// @ts-nocheck
import AnimeGrid from './components/AnimeGrid'

export default async function Home () {
  const anime: {
    link: string,
    img: string,
    title: string,
    episode: string
  }[] = await fetch(process.env.HOST + '/api/latestEpisodes', { next: { revalidate: 300 }, cache: 'no-store' }).then((res) => res.json())
  return (
    <AnimeGrid anime={anime} />
  )
}
