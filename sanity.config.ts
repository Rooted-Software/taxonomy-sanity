/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */
import {
  dashboardTool,
  projectInfoWidget,
  projectUsersWidget,
} from '@sanity/dashboard'
import { visionTool } from '@sanity/vision'
import { apiVersion, dataset, previewSecretId, projectId } from 'lib/sanity.api'
import { previewDocumentNode } from 'plugins/previewPane'
import { productionUrl } from 'plugins/productionUrl'
import { settingsPlugin, settingsStructure } from 'plugins/settings'
import { defineConfig } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { documentListWidget } from 'sanity-plugin-dashboard-widget-document-list'
import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel'
import { deskTool } from 'sanity/desk'
import authorType from 'schemas/author'
import docArticleType from 'schemas/docArticle'
import docCategoryType from 'schemas/docCategory'
import featuresType from 'schemas/features'
import postType from 'schemas/post'
import settingsType from 'schemas/settings'
import supportType from 'schemas/support'
import supportCategoryType from 'schemas/supportCategory'

import { enhancedNavbar } from '@/components/studio/enhancedNavbar'

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Rooted Template'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title,
  schema: {
    // If you want more content types, you can add them to this array
    types: [
      authorType,
      postType,
      settingsType,
      supportType,
      docArticleType,
      supportCategoryType,
      docCategoryType,
      featuresType,
    ],
  },
  plugins: [
    dashboardTool({
      widgets: [
        documentListWidget({
          title: 'Recent Documents',
        }),
        projectInfoWidget(),
        projectUsersWidget(),
        vercelWidget(),
      ],
    }),
    deskTool({
      structure: settingsStructure(settingsType),
      // `defaultDocumentNode` is responsible for adding a “Preview” tab to the document pane
      defaultDocumentNode: previewDocumentNode({ apiVersion, previewSecretId }),
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    settingsPlugin({ type: settingsType.name }),
    // Add the "Open preview" action
    productionUrl({
      apiVersion,
      previewSecretId,
      types: [
        postType.name,
        settingsType.name,
        supportType.name,
        docArticleType.name,
        supportCategoryType.name,
        docCategoryType.name,
        featuresType.name,
      ],
    }),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  studio: {
    components: {
      navbar: enhancedNavbar,
    },
  },
})
