// @ts-nocheck
import BrowseGrid from './BrowseGrid'
export default async function Browse ({ params }: { params: { page: string } }) {
  const page = params.pagenum
  const anime: {
    link: string,
    img: string,
    title: string,
    episode: string
  }[] = await fetch(process.env.HOST + '/api/browse' + (page ? '?page=' + page : ''), { next: { revalidate: 300 }, cache: 'no-store' }).then((res) => res.json())
  return (
    <BrowseGrid anime={anime} />
  )
}
