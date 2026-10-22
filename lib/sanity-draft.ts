import 'server-only'
import { draftMode } from 'next/headers'

export async function getSanityDraft() {
  const { isEnabled } = await draftMode()
  return { isEnabled, token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined }
}
