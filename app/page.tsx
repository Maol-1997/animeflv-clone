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
    <Container fluid className='home-section'>
      <Container className='home-content'>
        <span style={{ fontSize: '2rem' }}>Últimos episodios</span>
        <Row>
          {anime.length > 0 && anime.map((a) => (
            <Col key={'col-' + a.link} style={{ padding: '0', margin: '-0.5%' }} xs={12} sm={6} md={4} lg={3} xl={3}>
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
