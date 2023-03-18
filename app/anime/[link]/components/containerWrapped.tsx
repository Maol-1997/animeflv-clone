'use client'
import Container from 'react-bootstrap/Container'

// @ts-ignore
export default function ContainerWrapped ({ children, ...props }) {
  return (
    <Container {...props}>
      {children}
    </Container>
  )
}
