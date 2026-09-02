import * as React from 'react'
import { createAuthEmailHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

// Configuration
const SITE_NAME = "Kingdom Protocol"
const SENDER_DOMAIN = "notify.kingdomprotocol.app"
const ROOT_DOMAIN = "kingdomprotocol.app"
const FROM_DOMAIN = "kingdomprotocol.app"
const SITE_URL = `https://${ROOT_DOMAIN}`

// The SDK handler owns verification, dispatch, and retry semantics; this file
// owns only the email decisions: subjects, templates, and per-type props.
export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const handler = createAuthEmailHandler({
          apiKey: process.env['LOVABLE_API_KEY']!,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          senderDomain: SENDER_DOMAIN,
          sendUrl: process.env['LOVABLE_SEND_URL'],
          emails: {
            signup: {
              subject: 'Your Kingdom Protocol confirmation code',
              render: (data) =>
                React.createElement(SignupEmail, {
                  token: data.token ?? '',
                  confirmationUrl: data.url,
                }),
            },
            invite: {
              subject: 'You have been asked to stand watch',
              render: (data) =>
                React.createElement(InviteEmail, {
                  token: data.token ?? '',
                  confirmationUrl: data.url,
                }),
            },
            magiclink: {
              subject: 'Your Kingdom Protocol sign-in code',
              render: (data) =>
                React.createElement(MagicLinkEmail, {
                  token: data.token ?? '',
                  confirmationUrl: data.url,
                }),
            },
            recovery: {
              subject: 'Reset your Kingdom Protocol password',
              render: (data) =>
                React.createElement(RecoveryEmail, {
                  token: data.token ?? '',
                  confirmationUrl: data.url,
                }),
            },
            email_change: {
              subject: 'Confirm your new email',
              render: (data) =>
                React.createElement(EmailChangeEmail, {
                  token: data.token ?? '',
                  confirmationUrl: data.url,
                  oldEmail: data.old_email ?? '',
                  newEmail: data.new_email ?? '',
                }),
            },
            reauthentication: {
              subject: 'Your Kingdom Protocol verification code',
              render: (data) =>
                React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
            },
          },

        })
        return handler(request)
      },
    },
  },
})
