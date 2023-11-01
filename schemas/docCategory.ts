import { ComponentIcon } from '@sanity/icons'
import {
  orderRankField,
  orderRankOrdering,
} from '@sanity/orderable-document-list'
import { format, parseISO } from 'date-fns'
import { defineField, defineType } from 'sanity'

import authorType from './author'

/**
 * This file is the schema definition for a article.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit a article in the studio.
 * 
 * Here you can see the different schema types that are available:

  https://www.sanity.io/docs/schema-types

 */

export default defineType({
  name: 'docCategory',
  title: 'Documentation Category',
  icon: ComponentIcon,
  orderings: [
    {
      title: 'Rank',
      name: 'rank',
      by: [
        { field: 'orderRank', direction: 'asc' },
        { field: 'orderRank', direction: 'desc' },
      ],
    },
  ],
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
    }),
    orderRankField({ type: 'docCategory' }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return { title, media }
    },
  },
})
