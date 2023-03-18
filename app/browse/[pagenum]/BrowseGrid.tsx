// @ts-nocheck
'use client'
import Container from 'react-bootstrap/Container'
import AnimeCard from './BrowseAnimeCard'
import Styles from './BrowseAnimeCard.module.css'
import Link from 'next/link'

// @ts-ignore
export default function BrowseGrid ({ anime, page }: { anime: { link: string, img: string, title: string, episode: string }[], page: string }) {
  let prevPages = []
  const nextPages = []
  for (let i = 1; i < 4; i++) {
    if (Number(page) - i > 0) prevPages.push(Number(page) - i)
    if (Number(page) + i < 150) nextPages.push(Number(page) + i)
  }
  prevPages = prevPages.reverse()
  return (
    <Container fluid className='home-section'>
      <Container className='home-content'>
        <span style={{ fontSize: '2rem' }}>Lista completa de Animes</span>
        <div style={{ marginTop: '20px' }} className={Styles.grid}>
          {anime.list.length > 0 && anime.list.map((a: typeof anime) => (
            <AnimeCard key={a.link} anime={a} />
          ))}
        </div>
        <div className={Styles.buttons}>
          <Link href={'/browse/' + (Number(page) - 1)} {...(parseInt(page) === 1 ? { style: { pointerEvents: 'none', opacity: '0.5' } } : {})}>
            Anterior
          </Link>
          {Number(page) > 5 &&
            <Link href='/browse/1'>
              1
            </Link>}
          {prevPages.map((p: number) => (
            <Link key={p} href={'/browse/' + p}>
              {p}
            </Link>
          ))}
          <Link href={'/browse/' + page} style={{ pointerEvents: 'none', opacity: '0.5' }}>
            {page}
          </Link>
          {nextPages.map((p: number) => (
            <Link key={p} href={'/browse/' + p}>
              {p}
            </Link>
          ))}

          {Number(page) < 150 &&
            <Link href='/browse/150'>
              150
            </Link>}

          <Link href={'/browse/' + (Number(page) + 1)} {...(parseInt(page) >= 150 ? { style: { pointerEvents: 'none', opacity: '0.5' } } : {})}>
            Siguiente
          </Link>

        </div>
      </Container>
    </Container>
  )
}
