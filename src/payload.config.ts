import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import 'dotenv/config'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages/index'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { ShopPage } from '@/globals/ShopPage'
import { CutTypes } from './collections/ProductCategories/CutTypes'
import { Flavors } from './collections/ProductCategories/Flavors'
import { MeatTypes } from './collections/ProductCategories/MeatTypes'
import { Qualities } from './collections/ProductCategories/Qualities'
import { CartSettings } from './globals/CartSettings'
import { ShopLuxuryPage } from './globals/ShopLuxuryPage'
import { plugins } from './plugins'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Payload refuses an empty `secret`. Next runs `getPayload` during `next build` (e.g.
 * `generateStaticParams`), but platforms like Render often omit env vars from the build
 * environment. Use a placeholder only while the npm `build` script is running so CI
 * can finish; the running server must still set `PAYLOAD_SECRET`.
 */
function resolvePayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim()
  if (secret) return secret

  const isNextBuild =
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build'

  if (isNextBuild) {
    return 'build-only-placeholder-not-for-production-runtime'
  }

  return ''
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    Categories,
    Media,

    MeatTypes,
    CutTypes,
    Qualities,
    Flavors,
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Keep migration SQL in-repo; run `pnpm payload migrate` on deploy before `next build`.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer, ShopPage, ShopLuxuryPage, CartSettings],
  plugins,
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
