// @ts-nocheck
import styles from './Anime.module.css'
import Image from 'next/image'
import Link from 'next/link'
import Container from './components/containerWrapped'
import Atropos from './components/atroposWrapped'

export default async function AnimePage ({ params }: { params: { link: string }}) {
  const { link } = params

  const anime:{ animeInfo: [][], episodes: [] } = await fetch(process.env.HOST + '/api/anime/' + link).then((res) => res.json())

  const title = anime.animeInfo[1]
  const animeId = anime.animeInfo[0]
  return (
    <Container fluid style={{ marginTop: '150px' }}>
      <Container id={styles.anime_page}>
        <Atropos animeId={animeId} />
        <div>
          <h3>{title || 'Title'}</h3>
          <div id={styles.box}>
            <h4>Lista de episodios</h4>
            <div id={styles.episodes} style={{ padding: '0 5px', borderRadius: '12px', margin: '0 auto' }}>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#666666', margin: '10px 0' }} />
              {anime.episodes.map((episode) => (
                <div key={episode[0]}>
                  <Link href={'/ver/' + link + '-' + episode[0]} style={{ textDecoration: 'none', display: 'flex', position: 'relative', alignItems: 'center', color: '#01B5D5', padding: '5px 0' }}>
                    <Image src={'https://cdn.animeflv.net/screenshots/' + anime.animeInfo[0] + '/' + episode[0] + '/th_3.jpg'} alt='' width={110} height={60} style={{ borderRadius: '3px', objectFit: 'cover', marginRight: '15px' }} />
                    <div className={styles.epText}>
                      <span>{title}</span>
                      <br />
                      <span>Episodio {episode[0]}</span>
                    </div>
                  </Link>
                  <div style={{ width: '100%', height: '1px', backgroundColor: '#01B5D5' }} />

                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Container>
  )
}
