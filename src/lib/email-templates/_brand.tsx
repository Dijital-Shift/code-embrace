import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const GOLD = '#c9a84c'

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0',
  padding: '0',
}

export const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '32px 28px 40px',
}

export const wordmark = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '22px',
  letterSpacing: '0.08em',
  color: '#111111',
  margin: '0 0 2px',
  fontWeight: 'normal' as const,
}

export const kicker = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: GOLD,
  margin: '0 0 28px',
}

export const h1 = {
  fontSize: '20px',
  color: '#111111',
  margin: '0 0 14px',
  fontWeight: 'normal' as const,
}

export const text = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  color: '#444444',
  lineHeight: '1.7',
  margin: '0 0 20px',
}

export const codeBox = {
  backgroundColor: '#faf7ef',
  border: `1px solid ${GOLD}`,
  borderRadius: '6px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 0 22px',
}

export const codeText = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '30px',
  letterSpacing: '0.32em',
  color: '#111111',
  fontWeight: 'bold' as const,
  margin: '0',
}

export const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '6px',
  padding: '13px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const hr = { borderColor: '#eeeeee', margin: '32px 0 16px' }

export const footer = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '11px',
  color: '#999999',
  lineHeight: '1.6',
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
          <Heading as="h2" style={wordmark}>
            Kingdom Protocol
          </Heading>
          <Text style={kicker}>Accountability. No noise.</Text>
          <Heading as="h1" style={h1}>
            {heading}
          </Heading>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            Kingdom Protocol &middot; kingdomprotocol.app
            <br />
            If you weren&rsquo;t expecting this email, you can safely ignore it.
          </Text>
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
