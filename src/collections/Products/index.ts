import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, Where } from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    gallery: true,
    categories: true,
    meta: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    priceInUSD: true,
    inventory: true,
    productGallery: true,
  },
  fields: [
    ...(defaultCollection?.fields || []),

    {
      name: 'title',
      type: 'text',
      required: true,
    },

    slugField({
      fieldToUse: 'title',
    }),

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Luxury Product Content',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              label: 'Eyebrow',
              defaultValue: 'Curated Collection',
            },
            {
              name: 'badges',
              type: 'array',
              label: 'Badges',
              maxRows: 4,
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'productGallery',
              type: 'array',
              label: 'Gallery Images',
              maxRows: 6,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'whatsInside',
              type: 'array',
              label: "What's Inside",
              fields: [
                {
                  name: 'quantity',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'purchaseOptions',
              type: 'array',
              label: 'Purchase Options',
              minRows: 1,
              maxRows: 2,
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'price',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'subtext',
                  type: 'text',
                },
                {
                  name: 'highlighted',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'primaryCTA',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Subscribe Now' },
                { name: 'url', type: 'text', defaultValue: '#' },
              ],
            },
            {
              name: 'secondaryCTA',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'One-Time Purchase' },
                { name: 'url', type: 'text', defaultValue: '#' },
              ],
            },
            {
              name: 'reviewsHeading',
              type: 'text',
              defaultValue: 'Reviews',
            },
            {
              name: 'reviewsSummary',
              type: 'text',
              defaultValue: '4.9 Based on 128 Reviews',
            },
            {
              name: 'reviews',
              type: 'array',
              label: 'Reviews',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
                { name: 'body', type: 'textarea', required: true },
                {
                  name: 'rating',
                  type: 'number',
                  min: 1,
                  max: 5,
                  defaultValue: 5,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})