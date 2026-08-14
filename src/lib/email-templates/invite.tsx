import * as React from 'react'

import { Button, Text } from '@react-email/components'

import { CodeBlock, Panel, Shell, button, text, verse } from './_brand'

interface InviteEmailProps {
  token?: string
  confirmationUrl?: string
  inviterName?: string
  pathTitle?: string
}

export const InviteEmail = ({
  token,
  confirmationUrl,
  inviterName,
  pathTitle,
}: InviteEmailProps) => {
  const who = inviterName || 'Someone you know'
  return (
    <Shell
      preview={`${who} asked you to stand watch over their path`}
      heading={`${who} asked you to watch their path.`}
    >
      <Text style={text}>
        They put a specific behavior in writing
        {pathTitle ? (
          <>
            {' '}
            &mdash; <strong>{pathTitle}</strong>
          </>
        ) : null}
        , set the terms themselves, and then put your name on it. Not a friend
        request. A watch.
      </Text>

      <Panel
        title="What this asks of you"
        lines={[
          'Most days you hear nothing. Silence means they are standing.',
          'If they go quiet two days running, you get one message. One.',
          <>
            Your job is not the app. Your job is to reach out &mdash; a call, a
            verse, a meet-up.
          </>,
        ]}
      />

      <Text style={text}>
        They could have kept this private. They chose you instead, and no one
        else is watching this. If you say yes, be the person who actually picks
        up the phone.
      </Text>

      <Text style={verse}>
        &ldquo;But if the watchman see the sword come, and blow not the
        trumpet, and the people be not warned&hellip;&rdquo;
        <br />
        &mdash; Ezekiel 33:6 (KJV)
      </Text>

      {confirmationUrl ? (
        <Text style={text}>
          <Button style={button} href={confirmationUrl}>
            Accept and stand watch
          </Button>
        </Text>
      ) : null}
      {!confirmationUrl && token ? <CodeBlock token={token} /> : null}

      <Text style={text}>
        If you weren&rsquo;t expecting this, you can ignore it &mdash; nothing
        happens and no account is created.
      </Text>
    </Shell>
  )
}

export default InviteEmail
