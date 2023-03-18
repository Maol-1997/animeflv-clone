// @ts-nocheck
'use client'
import Container from 'react-bootstrap/Container'
import AnimeCard from './BrowseAnimeCard'
import Styles from './BrowseAnimeCard.module.css'

// @ts-ignore
export default function BrowseGrid ({ anime }: {link: string, img: string, title: string, episode: string[]}) {
  return (
    <Container fluid className='home-section'>
      <Container className='home-content'>
        <span style={{ fontSize: '2rem' }}>Lista completa de Animes</span>
        <div className={Styles.grid}>
          {anime.length > 0 && anime.map((a: typeof anime) => (
            <AnimeCard key={a.link} anime={a} />
          ))}
        </div>
      </Container>
    </Container>
  )
}
