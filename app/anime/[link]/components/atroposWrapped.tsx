// @ts-nocheck
'use client'
import Atropos from 'myatropos/react'
import styles from '../Anime.module.css'
import Image from 'next/image'
import 'myatropos/atropos.css'
export default function AtroposWrapped (params:string) {
  const animeId = params.animeId
  return (
    <div className='atr-helper'>
      <Atropos className='atropos-banner' highlight id={styles.atropos}>
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <Image className='atropos-banner-spacer' src={'https://www3.animeflv.net/uploads/animes/covers/' + animeId + '.jpg'} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
          <Image data-atropos-offset='-4.5' src={'https://www3.animeflv.net/uploads/animes/covers/' + animeId + '.jpg'} alt='' width={300} height={200} style={{ borderRadius: '12px' }} />
        </div>
      </Atropos>
    </div>
  )
}
