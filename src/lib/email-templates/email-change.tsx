import * as React from 'react'

import { Text } from '@react-email/components'

import { CodeBlock, Shell, text } from './_brand'

interface EmailChangeEmailProps {
  token?: string
  confirmationUrl?: string
  oldEmail?: string
  newEmail?: string
}

export const EmailChangeEmail = ({
  token,
  oldEmail,
  newEmail,
}: EmailChangeEmailProps) => (
  <Shell
    preview="Confirm your new Kingdom Protocol email"
    heading="Confirm your new email"
  >
    <Text style={text}>
      {oldEmail && newEmail
        ? `Confirming the change from ${oldEmail} to ${newEmail}.`
        : 'Confirming your new email address.'}
    </Text>
    <CodeBlock token={token} />
    <Text style={text}>
      If you didn&rsquo;t request this change, ignore this email and your address
      stays as it is.
    </Text>
  </Shell>
)

export default EmailChangeEmail
