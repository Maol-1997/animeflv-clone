// @ts-nocheck
'use client'
import Image from 'next/image'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Styles from '../browse/[pagenum]/BrowseAnimeCard.module.css'

export default function NavBar () {
  const [expand, updateExpanded] = useState(false)
  const [navColour, updateNavbar] = useState(false)
  const [searchUserValue, updateSearchUserValue] = useState('')
  const [searchOutput, updateSearchOutput] = useState([])

  useEffect(() => {
    function scrollHandler () {
      if (window.scrollY >= 20) {
        updateNavbar(true)
      } else {
        updateNavbar(false)
      }
    }

    window.addEventListener('scroll', scrollHandler)
  }, [])

  useEffect(() => {
    if (searchUserValue.length === 0) return
    const timeout = setTimeout(() => {
      fetch(`/api/search/${searchUserValue}`).then(res => res.json()).then(data => {
        updateSearchOutput(data)
      })
    }, 300)
    console.log({ searchUserValue, searchOutput })
    return () => clearTimeout(timeout)
  }, [searchUserValue])

  const searchFn = (e: any) => {
    e.preventDefault()
    updateSearchUserValue(e.target.value)
  }

  return (
    <Navbar
      expanded={expand}
      fixed='top'
      expand='md'
      className={navColour ? 'sticky' : 'navbar'}
    >
      <Container>
        <Navbar.Brand href='/' className='d-flex'>
          <Image src='/logo.png' className='img-fluid logo' alt='logo' width={142} height={46} />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls='responsive-navbar-nav'
          onClick={() => {
            // @ts-ignore
            updateExpanded(expand ? false : 'expanded')
          }}
        >
          <span />
          <span />
          <span />
        </Navbar.Toggle>
        <Navbar.Collapse style={{ flex: 'inherit' }}>
          <Nav className='ms-auto' defaultActiveKey='#home'>

            <Nav.Item style={{ alignSelf: 'center' }}>
              <Link href='/' onClick={() => updateExpanded(false)} className='linksText'>
                Inicio
              </Link>
            </Nav.Item>

            <Nav.Item style={{ alignSelf: 'center' }}>
              <Link href='/browse/1' onClick={() => updateExpanded(false)} className='linksText'>
                Directorio Anime
              </Link>
            </Nav.Item>

            <Nav.Item style={{ alignSelf: 'center' }}>
              <div className='search'>
                <input type='text' className='searchTerm' placeholder='Buscar...' onInput={searchFn} />
                <div className='searchPopup'>
                  {searchOutput.map((anime: any) => (
                    <Link key={anime.link} href={'anime/' + anime.link} className='searchItem'>
                      <Image src={anime.img} alt='anime-image' width={80} height={80} style={{ width: 'fit-content', height: 'fit-content' }} />
                      <div className='searchPopupText'>
                        <span>{anime.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
