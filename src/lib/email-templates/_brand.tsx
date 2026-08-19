import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const GOLD = '#c9a84c'
export const INK = '#0a0800'
export const ROOT_URL = 'https://kingdomprotocol.app'
export const LOGO_URL = `${ROOT_URL}/kingdom-protocol-logo.png`

export const main = {
  backgroundColor: '#f4f1ea',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0',
  padding: '0',
}

export const container = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '0',
  backgroundColor: '#ffffff',
}

export const headerBand = {
  backgroundColor: INK,
  padding: '30px 28px 24px',
  textAlign: 'center' as const,
}

export const logo = {
  display: 'block',
  margin: '0 auto 14px',
}

export const wordmark = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '21px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: GOLD,
  margin: '0 0 6px',
  fontWeight: 'normal' as const,
}

export const kicker = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '9px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: '#8a7c52',
  margin: '0',
}

export const goldRule = {
  backgroundColor: GOLD,
  height: '3px',
  lineHeight: '3px',
  fontSize: '0',
}

export const content = {
  padding: '34px 30px 30px',
}

export const h1 = {
  fontSize: '21px',
  lineHeight: '1.35',
  color: '#111111',
  margin: '0 0 16px',
  fontWeight: 'normal' as const,
}

export const text = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  color: '#3d3a33',
  lineHeight: '1.75',
  margin: '0 0 18px',
}

export const panel = {
  backgroundColor: '#faf7ef',
  borderLeft: `3px solid ${GOLD}`,
  padding: '18px 20px 6px',
  margin: '0 0 22px',
}

export const panelTitle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#8a7c52',
  fontWeight: 'bold' as const,
  margin: '0 0 12px',
}

export const panelLine = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '13.5px',
  color: '#3d3a33',
  lineHeight: '1.7',
  margin: '0 0 12px',
}

export const verse = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic' as const,
  fontSize: '13.5px',
  color: '#6b6350',
  lineHeight: '1.8',
  margin: '0 0 22px',
}

export const codeBox = {
  backgroundColor: '#faf7ef',
  border: `1px solid ${GOLD}`,
  borderRadius: '6px',
  padding: '22px',
  textAlign: 'center' as const,
  margin: '0 0 22px',
}

export const codeText = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '32px',
  letterSpacing: '0.34em',
  color: '#111111',
  fontWeight: 'bold' as const,
  margin: '0',
}

export const button = {
  backgroundColor: INK,
  color: GOLD,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '13px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold' as const,
  border: `1px solid ${GOLD}`,
  borderRadius: '4px',
  padding: '14px 30px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const footerBand = {
  backgroundColor: INK,
  padding: '24px 30px',
  textAlign: 'center' as const,
}

export const footer = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '11px',
  color: '#8a8272',
  lineHeight: '1.7',
  margin: '0 0 8px',
}

export const credit = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: '#5c5647',
  margin: '0',
}

export function Shell({
  preview,
  heading,
  children,
}: {
  preview: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Img
              src={LOGO_URL}
              width="64"
              height="64"
              alt="Kingdom Protocol"
              style={logo}
            />
            <Heading as="h2" style={wordmark}>
              Kingdom Protocol
            </Heading>
            <Text style={kicker}>Accountability. No noise.</Text>
          </Section>
          <Section style={goldRule}>
            <Text style={{ margin: 0, fontSize: '0', lineHeight: '3px' }}>&nbsp;</Text>
          </Section>
          <Section style={content}>
            <Heading as="h1" style={h1}>
              {heading}
            </Heading>
            {children}
          </Section>
          <Section style={footerBand}>
            <Text style={footer}>
              Kingdom Protocol &middot; kingdomprotocol.app
              <br />
              You only hear from us when it matters. Silence means they&rsquo;re standing.
            </Text>
            <Text style={credit}>Dijital System &middot; 02</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function CodeBlock({ token }: { token?: string }) {
  if (!token) return null
  return (
    <Section style={codeBox}>
      <Text style={codeText}>{token}</Text>
    </Section>
  )
}

export function Panel({
  title,
  lines,
}: {
  title: string
  lines: React.ReactNode[]
}) {
  return (
    <Section style={panel}>
      <Text style={panelTitle}>{title}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={panelLine}>
          {line}
        </Text>
      ))}
    </Section>
  )
}
