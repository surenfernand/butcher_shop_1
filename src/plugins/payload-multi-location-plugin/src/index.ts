import type { Config, Plugin } from 'payload'
import type { MultiLocationPluginOptions } from './types'
import { createBranchesCollection } from './collections/Branches'
import { createBranchInventoryCollection } from './collections/BranchInventory'
import { createFulfillmentSchedulesCollection } from './collections/FulfillmentSchedules'
import { createBranchHolidaysCollection } from './collections/BranchHolidays'
import { findBranchEndpoint } from './endpoints/findBranch'
import { getFulfillmentOptionsEndpoint } from './endpoints/getFulfillmentOptions'
import { getProductBranchPriceEndpoint } from './endpoints/getProductBranchPrice'
import { reduceBranchInventory } from './hooks/reduceBranchInventory'
import { validateBranchInventory } from './hooks/validateBranchInventory'
import { validateMaxOrdersPerDay } from './hooks/validateMaxOrdersPerDay'

export const multiLocationPlugin = (options: MultiLocationPluginOptions = {}): Plugin => {
  const {
    enabled = true,
    productSlug = 'products',
    orderSlug = 'orders',
    adminGroup = 'Shop',
  } = options

  return (incomingConfig: Config): Config => {
    if (!enabled) return incomingConfig

    const collections = incomingConfig.collections || []

    const patchedCollections = collections.map((collection) => {
      if (collection.slug !== orderSlug) return collection

      return {
        ...collection,
        fields: [
          ...collection.fields,
          {
            name: 'fulfillment',
            type: 'group',
            admin: { position: 'sidebar' },
            fields: [
              { name: 'branch', type: 'relationship', relationTo: 'branches' },
              {
                name: 'serviceType',
                type: 'select',
                options: [
                  { label: 'Pickup', value: 'pickup' },
                  { label: 'Delivery', value: 'delivery' },
                ],
              },
              { name: 'date', type: 'date' },
              { name: 'timeSlot', type: 'text' },
              { name: 'postalCode', type: 'text' },
              { name: 'notes', type: 'textarea' },
            ],
          },
        ],
        hooks: {
          ...collection.hooks,
          beforeValidate: [
            ...(collection.hooks?.beforeValidate || []),
            validateBranchInventory({ orderSlug }),
            validateMaxOrdersPerDay(orderSlug),
          ],
          afterChange: [
            ...(collection.hooks?.afterChange || []),
            reduceBranchInventory(),
          ],
        },
      }
    })

    return {
      ...incomingConfig,
      collections: [
        ...patchedCollections,
        createBranchesCollection(adminGroup),
        createBranchInventoryCollection(productSlug, adminGroup),
        createFulfillmentSchedulesCollection(productSlug, adminGroup),
        createBranchHolidaysCollection(adminGroup),
      ],
      endpoints: [
        ...(incomingConfig.endpoints || []),
        findBranchEndpoint,
        getProductBranchPriceEndpoint,
        getFulfillmentOptionsEndpoint,
      ],
    }
  }
}

export default multiLocationPlugin
