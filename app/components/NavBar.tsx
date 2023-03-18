'use client'
import Image from 'next/image'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NavBar () {
  const [expand, updateExpanded] = useState(false)
  const [navColour, updateNavbar] = useState(false)

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
            <Nav.Item>
              <Link href='/' onClick={() => updateExpanded(false)} className='linksText'>
                Inicio
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link href='/browse' onClick={() => updateExpanded(false)} className='linksText'>
                Directorio Anime
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
