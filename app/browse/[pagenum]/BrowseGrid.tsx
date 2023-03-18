// @ts-nocheck
'use client'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import AnimeCard from './BrowseAnimeCard'

// @ts-ignore
export default function BrowseGrid ({ anime }: {link: string, img: string, title: string, episode: string[]}) {
  return (
    <Container fluid className='home-section'>
      <Container className='home-content'>
        <span style={{ fontSize: '2rem' }}>Lista completa de Animes</span>
        <Row>
          {anime.length > 0 && anime.map((a: typeof anime) => (
            <Col key={'col-' + a.link} style={{ padding: '0', margin: '-0.5%' }} xs={12} sm={6} md={4} lg={3} xl={2}>
              <AnimeCard key={a.link} anime={a} />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  )
}
