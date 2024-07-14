'use client'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import AnimeCard from './AnimeCard'

interface Anime {
    link: string;
    img: string;
    title: string;
    episode: string[];
}

interface AnimeGridProps {
    anime: Anime[];
}
// @ts-ignore
export default function AnimeGrid ({ anime }: AnimeGridProps) {
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
      </Container>
    </Container>
  )
}
