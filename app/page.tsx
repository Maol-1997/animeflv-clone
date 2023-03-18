// @ts-nocheck
'use client'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useState, useEffect } from 'react'
import AnimeCard from './components/AnimeCard'

export default function Home () {
  const [anime, setAnime] = useState([])
  useEffect(() => {
    fetch('/api/latestEpisodes').then((res) => res.json()).then((data) => {
      setAnime(data)
    })
  }, [])

  return (
    <Container fluid className='home-section' id='home'>
      <Container className='home-content'>
        <Row>
          {anime.length > 0 && anime.map((a) => (
            <Col key={'col-' + a.link} md={3}>
              <AnimeCard key={a.link} anime={a} />
            </Col>
          ))}
        </Row>

        {/*
          <Col md={3} style={{ paddingBottom: 20 }}>
            <img src='/logo.png' alt='logo' className='img-fluid' />
          </Col>

          <Col md={3} style={{ paddingBottom: 20 }}>
            <strong>asdasda</strong>
          </Col>
          <Col md={3} style={{ paddingBottom: 20 }}>
            <strong>asdasda</strong>
          </Col>
          <Col md={3} style={{ paddingBottom: 20 }}>
            <strong>asdasda</strong>
          </Col> */}
      </Container>
    </Container>
  )
}
