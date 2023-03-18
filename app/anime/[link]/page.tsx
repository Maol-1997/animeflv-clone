'use client'
import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import styles from './Anime.module.css'
import Atropos from 'myatropos/react'
import 'myatropos/atropos.css'
import Image from 'next/image'
import Link from 'next/link'

export default function AnimePage ({ params }: { params: { link: string } }) {
  const { link } = params
  const [anime, setAnime] = useState({ animeInfo: [], episodes: [] })
  useEffect(() => {
    fetch('/api/anime/' + link).then((res) => res.json()).then((data) => {
      setAnime(data)
    })
  }, [link])

  const title = anime.animeInfo.length ? anime.animeInfo[1] : ''
  return (
    <Container fluid style={{ marginTop: '150px' }}>
      <Container id={styles.anime_page}>
        <div>
          <Atropos className='atropos-banner' highlight id={styles.atropos}>
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
              <Image className='atropos-banner-spacer' src={'https://www3.animeflv.net/uploads/animes/covers/' + anime.animeInfo[0] + '.jpg'} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
              <Image data-atropos-offset='-4.5' src={'https://www3.animeflv.net/uploads/animes/covers/' + anime.animeInfo[0] + '.jpg'} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
            </div>
          </Atropos>
        </div>
        <div>
          <h3>{title || 'Title'}</h3>
          <Container>
            <div>
              <h4 style={{ marginTop: '50px' }}>Episodios</h4>
              <div style={{ border: '1px solid #01B5D5', width: 'fit-content', padding: '0 5px', borderRadius: '12px' }}>
                {anime.episodes.map((episode) => (
                  <Link key={episode[0]} href={'/ver/' + link + '-' + episode[0]} style={{ textDecoration: 'none' }}>
                    <div className={styles.epText}>
                      <span>{title}</span>
                      <br />
                      <span>Episodio {episode[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </Container>
    </Container>
  )
}
