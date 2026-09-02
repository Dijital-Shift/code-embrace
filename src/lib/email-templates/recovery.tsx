import * as React from 'react'

import { Button, Text } from '@react-email/components'

import { CodeBlock, Shell, button, text } from './_brand'

interface RecoveryEmailProps {
  token?: string
  confirmationUrl?: string
}

export const RecoveryEmail = ({ token, confirmationUrl }: RecoveryEmailProps) => (
  <Shell preview="Reset your Kingdom Protocol password" heading="Reset your password">
    {token ? (
      <>
        <Text style={text}>Use this code to reset your password:</Text>
        <CodeBlock token={token} />
      </>
    ) : null}
    {confirmationUrl ? (
      <Text style={text}>
        <Button style={button} href={confirmationUrl}>
          Reset password
        </Button>
      </Text>
    ) : null}
    <Text style={text}>
      If you didn&rsquo;t request this, nothing changes &mdash; ignore this email.
    </Text>
  </Shell>
)

export default RecoveryEmail
