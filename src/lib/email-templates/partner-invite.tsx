import { InviteEmail } from './invite'
import type { TemplateEntry } from './registry'

/**
 * Watchman invite sent from the app when a user asks someone to stand watch
 * over one of their paths. Reuses the branded invite email component.
 */
export const template = {
  component: InviteEmail,
  subject: (data: Record<string, any>) =>
    `${data?.inviterName || 'Someone you know'} asked you to stand watch`,
  displayName: 'Watchman invite',
  previewData: {
    inviterName: 'Justin',
    pathTitle: 'Morning prayer',
    confirmationUrl: 'https://kingdomprotocol.app/login',
  },
} satisfies TemplateEntry
