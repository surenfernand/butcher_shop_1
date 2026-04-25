import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../utilities/access'

export const createBranchesCollection = (adminGroup = 'Shop'): CollectionConfig => ({
  slug: 'branches',
  admin: {
    useAsTitle: 'name',
    group: adminGroup,
    defaultColumns: ['name', 'code', 'isActive'],
  },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', unique: true, index: true, required: true },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    {
      name: 'serviceTypes',
      type: 'select',
      hasMany: true,
      defaultValue: ['pickup', 'delivery'],
      options: [
        { label: 'Pickup', value: 'pickup' },
        { label: 'Delivery', value: 'delivery' },
      ],
    },
    {
      name: 'postalCodes',
      label: 'Postal codes / FSA prefixes served',
      type: 'array',
      fields: [{ name: 'code', type: 'text', required: true }],
      admin: {
        description: 'Use full postal codes or prefixes such as M5V. Spaces/case are normalized by the API.',
      },
    },
    {
      name: 'openingHours',
      type: 'json',
      admin: { description: 'Example: {"monday":[{"open":"09:00","close":"18:00"}]}' },
    },
    {
      name: 'holidayMessage',
      type: 'textarea',
      defaultValue: 'This branch is closed today.',
    },
  ],
})
