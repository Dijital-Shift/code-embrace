import * as React from 'react'

import { Button, Text } from '@react-email/components'

import { CodeBlock, Shell, button, text } from './_brand'

interface InviteEmailProps {
  token?: string
  confirmationUrl?: string
}

export const InviteEmail = ({ token, confirmationUrl }: InviteEmailProps) => (
  <Shell
    preview="You've been invited to Kingdom Protocol"
    heading="You've been invited"
  >
    <Text style={text}>
      Someone asked you to walk with them. Accept the invitation to get started.
    </Text>
    {confirmationUrl ? (
      <Text style={text}>
        <Button style={button} href={confirmationUrl}>
          Accept invitation
        </Button>
      </Text>
    ) : null}
    {!confirmationUrl && token ? <CodeBlock token={token} /> : null}
    <Text style={text}>
      If you weren&rsquo;t expecting this, you can ignore this email.
    </Text>
  </Shell>
)

export default InviteEmail
