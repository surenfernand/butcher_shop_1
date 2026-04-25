import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../utilities/access'

export const createFulfillmentSchedulesCollection = (productSlug = 'products', adminGroup = 'Shop'): CollectionConfig => ({
  slug: 'fulfillment-schedules',
  admin: { useAsTitle: 'name', group: adminGroup },
  access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'branch', type: 'relationship', relationTo: 'branches', index: true },
    { name: 'products', type: 'relationship', relationTo: productSlug, hasMany: true },
    {
      name: 'serviceType',
      type: 'select',
      defaultValue: 'delivery',
      options: [
        { label: 'Delivery', value: 'delivery' },
        { label: 'Pickup', value: 'pickup' },
      ],
      required: true,
    },
    { name: 'postalCodes', type: 'array', fields: [{ name: 'code', type: 'text', required: true }] },
    {
      name: 'availableDates',
      type: 'array',
      fields: [{ name: 'date', type: 'date', required: true }],
    },
    {
      name: 'weeklyDays',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
      ],
    },
    { name: 'timeSlots', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'maxOrdersPerDay', type: 'number', min: 0 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
})
