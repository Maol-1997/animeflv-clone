import Link from 'next/link'
import Atropos from 'myatropos/react'
import 'myatropos/atropos.css'
import Image from 'next/image'
import styles from '../../components/AnimeCard.module.css'
import ownStyles from './BrowseAnimeCard.module.css'

// @ts-ignore
export default function AnimeCard ({ anime }) {
  return (
    <div className='atr-container atr-helper'>
      <Link href={anime.link}>
        <Atropos className='atropos-banner' highlight={false} id={ownStyles.atropos}>
          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <Image className='atropos-banner-spacer' src={anime.img} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
            <Image data-atropos-offset='-4.5' src={anime.img} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
            <div className='atropos-banner-text' data-atropos-offset='2' style={{ bottom: '5%', top: 'auto' }}>
              <div className={styles.container} style={{ maxWidth: '12em' }}>
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
}
