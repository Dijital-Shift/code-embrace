/** Only public app hosts may automatically adopt a device clock. */
export function allowsAutomaticTimezone(hostname: string, automated = false): boolean {
  return !automated && [
    'kingdomprotocol.app',
    'www.kingdomprotocol.app',
    'kingdomprotocol.lovable.app',
  ].includes(hostname.toLowerCase());
}