import * as React from 'react'

import { Text } from '@react-email/components'

import { CodeBlock, Shell, text } from './_brand'

interface MagicLinkEmailProps {
  token?: string
  confirmationUrl?: string
}

export const MagicLinkEmail = ({ token }: MagicLinkEmailProps) => (
  <Shell preview="Your Kingdom Protocol sign-in code" heading="Your sign-in code">
    <Text style={text}>Enter this code to step back in:</Text>
    <CodeBlock token={token} />
    <Text style={text}>
      The code expires in 10 minutes. If you didn&rsquo;t ask to sign in, do nothing
      &mdash; no one gets in without this code.
    </Text>
  </Shell>
)

export default MagicLinkEmail
