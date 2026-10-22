import {
  apiVersion,
  dataset,
  previewSecretId,
  projectId,
  useCdn,
} from 'lib/sanity.api'
import { postBySlugQuery } from 'lib/sanity.queries'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { PageConfig } from 'next/types'
import { createClient } from 'next-sanity'
import { getSecret } from 'plugins/productionUrl/utils'

// res.setDraftMode only exists in the nodejs runtime, setting the config here allows changing the global runtime
// option in next.config.mjs without breaking preview mode
export const config = { runtime: 'nodejs' } satisfies PageConfig

function redirectToPreview(
  res: NextApiResponse<string | void>,
  Location: '/' | `/posts/${string}`
): void {
  // Enable Draft Mode after validating the existing preview secret
  res.setDraftMode({ enable: true })
  // Redirect to a preview capable route
  res.writeHead(307, { Location })
  res.end()
}

const _client = createClient({ projectId, dataset, apiVersion, useCdn })

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse<string | void>
) {
  // Private previews always require the configured secret. For public data,
  // you can also require preview mode sessions to be started from the Studio, set the SANITY_REQUIRE_PREVIEW_SECRET
  // environment variable to 'true'. The benefit of doing this that unauthorized users attempting to brute force into your
  // preview mode won't make it past the secret check, and only legitimate users are able to bypass the statically generated pages and load up
  // the serverless-powered preview mode.
  if (
    (process.env.SANITY_REQUIRE_PREVIEW_SECRET === 'true' || process.env.SANITY_API_READ_TOKEN) &&
    !req.query.secret
  ) {
    return res.status(401).send('Invalid secret')
  }

  // Validate the secret on the server; the private read token never enters cookies or client props.
  if (req.query.secret) {
    const token = process.env.SANITY_API_READ_TOKEN
    if (!token) {
      return res.status(401).send('Invalid secret')
    }
    const client = _client.withConfig({ useCdn: false, token })
    const secret = await getSecret(client, previewSecretId)
    if (req.query.secret !== secret) {
      return res.status(401).send('Invalid secret')
    }
  }

  // If no slug is provided open preview mode on the frontpage
  if (!req.query.slug) {
    return redirectToPreview(res, '/')
  }

  // Check if the post with the given `slug` exists
  const client = _client.withConfig({
    // Fallback to using the WRITE token until https://www.sanity.io/docs/vercel-integration starts shipping a READ token.
    // As this client only exists on the server and the token is never shared with the browser, we don't risk escalating permissions to untrustworthy users
    token:
      process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  })
  const post = await client.fetch(postBySlugQuery, {
    slug: req.query.slug,
  })

  // If the slug doesn't exist prevent preview mode from being enabled
  if (!post) {
    return res.status(401).send('Invalid slug')
  }

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  redirectToPreview(res, `/posts/${post.slug}`)
}
