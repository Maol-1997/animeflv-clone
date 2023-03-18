import Link from 'next/link'
import 'atropos/css/min'
import Image from 'next/image'
import Styles from './BrowseAnimeCard.module.css'

// @ts-ignore
export default function AnimeCard ({ anime }) {
  return (
    <Link href={`/anime/${anime.link}`}>
      <div className={Styles.imageContainer}>
        <Image data-atropos-offset='-4.5' src={anime.img} alt='' width={260} height={370} style={{ borderRadius: '12px' }} />
      </div>
      <div className={Styles.textContainer}>
        <span> {anime.title} </span>
      </div>
    </Link>
  )
}
