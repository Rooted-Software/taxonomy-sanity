import { getImageDimensions } from '@sanity/asset-utils'
import urlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId, useCdn } from 'lib/sanity.api'
import { createClient } from 'next-sanity'

// this is used in PortableText Output
export const BasicImage = ({ value, isInline }) => {
  const { width, height } = getImageDimensions(value)
  const client = createClient({ projectId, dataset, apiVersion, useCdn })
  return (
    <img
      src={urlBuilder(client)
        .image(value)
        .width(isInline ? 100 : 800)
        .fit('max')
        .auto('format')
        .url()}
      alt={value.alt || ' '}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? 'inline-block' : 'block',

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  )
}
