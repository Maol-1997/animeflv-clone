import Link from 'next/link'
import Atropos from 'myatropos/react'
import 'myatropos/atropos.css'
import Image from 'next/image'
import styles from './AnimeCard.module.css'

export default function AnimeCard ({ anime }: { anime: { link: string, img: string, title: string, episode: string } }) {
  return (
    <div className='atr-container'>
      <Link href={anime.link}>
        <Atropos className='atropos-banner' highlight={false}>
          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <Image className='atropos-banner-spacer' src={'https://www3.animeflv.net' + anime.img} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
            <Image data-atropos-offset='-4.5' src={'https://www3.animeflv.net' + anime.img} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
            <div className='atropos-banner-text' data-atropos-offset='2' style={{ bottom: '5%', top: 'auto' }}>
              <div className={styles.container}>
                <div style={{ backgroundColor: 'orange', borderRadius: '12px', padding: '0 5px', width: 'fit-content' }}>
                  <strong className={styles.episode}>{anime.episode}</strong>
                </div>
                <strong className={styles.title}>{anime.title}</strong>

              </div>
            </div>
          </div>
        </Atropos>
      </Link>
    </div>
  )

  /* return (
    <div className={styles.videoCard}>
      <Link href={anime.link}>
        <Image src={'https://www3.animeflv.net' + anime.img} alt='img' width={300} height={200} />
      </Link>
      <div className={styles.videoCard__info}>
        <h3>{anime.title}</h3>
        <h5>{anime.episode}</h5>
      </div>
    </div>
  ) */
}
