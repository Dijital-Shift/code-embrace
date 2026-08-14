import * as React from 'react'

import { Text } from '@react-email/components'

import { CodeBlock, Shell, text } from './_brand'

interface SignupEmailProps {
  token?: string
  confirmationUrl?: string
}

export const SignupEmail = ({ token }: SignupEmailProps) => (
  <Shell
    preview="Your Kingdom Protocol confirmation code"
    heading="Confirm your email"
  >
    <Text style={text}>Enter this code to finish setting up your account:</Text>
    <CodeBlock token={token} />
    <Text style={text}>
      The code expires in 10 minutes. If you didn&rsquo;t create an account, you can
      ignore this email.
    </Text>
  </Shell>
)

export default SignupEmail
