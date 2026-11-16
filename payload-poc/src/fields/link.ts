import type { Field, GroupField } from 'payload'

export const buttonAppearances = [
  { label: 'Blue (primary)', value: 'primary' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'White', value: 'white' },
  { label: 'Outline', value: 'outline' },
] as const

export type ButtonAppearance = (typeof buttonAppearances)[number]['value']

const linkFields: Field[] = [
  {
    type: 'row',
    fields: [
      // Not required: an empty button is simply not rendered, so optional buttons can be left blank.
      { name: 'label', type: 'text' },
      {
        name: 'url',
        type: 'text',
        admin: { description: 'A page path (/donate), an anchor (#donate) or a full URL.' },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'appearance',
        type: 'select',
        defaultValue: 'primary',
        options: [...buttonAppearances],
      },
      { name: 'newTab', label: 'Open in a new tab', type: 'checkbox', defaultValue: false },
    ],
  },
]

/** A single call-to-action button. */
export const link = (name: string, overrides: Partial<GroupField> = {}): GroupField => ({
  name,
  type: 'group',
  fields: linkFields,
  ...overrides,
})

/** A row of call-to-action buttons. */
export const links = (name = 'buttons'): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: linkFields,
})

/** Label/value pairs, e.g. bank details or contact lines. */
export const details = (name = 'details'): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Line', plural: 'Lines' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
})
