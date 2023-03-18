// @ts-nocheck
'use client'
import Plyr from 'plyr-react'
import 'plyr-react/plyr.css'
import styles from './Ver.module.css'
import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import { useEffect, useState } from 'react'

export default function VerPage ({ params }: { params: { link: string } }) {
  const { link } = params
  const [nextPage, setNextPage] = useState(false)
  useEffect(() => {
    const episode = link.split('-').slice(-1)[0]
    fetch('/api/anime/' + link.replace('-' + episode, '')).then((res) => res.json()).then((data) => {
      setNextPage(data.episodes > Number(episode))
    })
  }, [link])

  const plyrProps = {
    source: {
      type: 'video',
      sources: [
        {
          src: '/api/ver/' + link,
          type: 'video/mp4'
        }
      ]
    },
    options: {
      autoplay: false,
      ratio: '16:9'
    }
  }
  const title = link.split('-').slice(0, -1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const episode = link.split('-').slice(-1)[0]

  return (
    <Container fluid className='home-section'>
      <Container className='home-content'>
        <div style={{ color: '#F1F1F1' }}>
          <h3>{title}</h3>
          <h6 key='ep' style={{ color: '#666666' }}>Episodio {episode}</h6>
        </div>
        <div key='plyr'>
          <Plyr {...plyrProps} />
        </div>
        <div className={styles.buttons}>
          <Link href={'/ver/' + link.split('-').slice(0, -1).join('-') + '-' + (parseInt(episode) - 1)} {...(parseInt(episode) === 1 ? { style: { pointerEvents: 'none', opacity: '0.5' } } : {})}>
            Anterior
          </Link>
          {/* next link is disabled by default */}
          <Link href={'/ver/' + link.split('-').slice(0, -1).join('-') + '-' + (parseInt(episode) + 1)} {...(nextPage ? {} : { style: { pointerEvents: 'none', opacity: '0.5' } })}>
            Siguiente
          </Link>
          <Link href={'/anime/' + link.split('-').slice(0, -1).join('-')}>
            Lista de episodios
          </Link>
        </div>
      </Container>
    </Container>
  )
}
