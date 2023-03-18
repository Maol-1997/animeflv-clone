// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import Plyr from 'plyr-react'
import 'plyr-react/plyr.css'
import styles from './Ver.module.css'

export default function VerPage ({ params }: { params: { link: string } }) {
  const { link } = params
  const [videoInfo, setVideoInfo] = useState()
  useEffect(() => {
    if (link) {
      fetch(`/api/ver/${link}`).then((res) => res.json()).then((data) => {
        setVideoInfo(data)
      })
    }
  }, [link])

  const plyrProps = {
    source: {
      type: 'video',
      sources: [
        {
          src: videoInfo?.url,
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
    <div id={styles.videoContainer}>
      <div style={{ color: '#F1F1F1' }}>
        <h3>{title}</h3>
        <h6 style={{ color: '#666666' }}>Episodio {episode}</h6>
      </div>
      <div key='plyr'>
        <Plyr {...plyrProps} />
      </div>
    </div>
  )
}
