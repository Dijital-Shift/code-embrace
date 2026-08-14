import * as React from 'react'

import { Text } from '@react-email/components'

import { CodeBlock, Shell, text } from './_brand'

interface ReauthenticationEmailProps {
  token?: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Shell
    preview="Your Kingdom Protocol verification code"
    heading="Your verification code"
  >
    <Text style={text}>Enter this code to confirm it&rsquo;s you:</Text>
    <CodeBlock token={token} />
    <Text style={text}>The code expires in 10 minutes.</Text>
  </Shell>
)

export default ReauthenticationEmail
