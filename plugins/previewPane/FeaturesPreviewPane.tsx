/**
 * This component is responsible for rendering a preview of the Features public page inside the Studio.
 */
import { Card, Flex, Spinner, Text } from '@sanity/ui'

type Props = {
  previewSecretId: `${string}.${string}`
  apiVersion: string
}

export default function PostPreviewPane(props: Props) {
  return (
    <Card
      scheme="light"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <iframe
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}
        src={'/features'}
      />
      <Flex
        as={Card}
        justify="center"
        align="center"
        height="fill"
        direction="column"
        gap={4}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Text muted>Loading…</Text>
        <Spinner muted />
      </Flex>
    </Card>
  )
}
