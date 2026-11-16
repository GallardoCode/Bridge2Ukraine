/** Tiny builders for Lexical rich-text JSON, so seed content stays readable. */

type Text = { text: string; bold?: boolean }
type Inline = string | Text

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

const textNode = (t: Inline) => {
  const { text, bold } = typeof t === 'string' ? { text: t, bold: false } : t
  return { type: 'text', text, format: bold ? 1 : 0, detail: 0, mode: 'normal', style: '', version: 1 }
}

export const p = (...inline: Inline[]) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline.map(textNode) })
export const h3 = (text: string) => ({ ...base, type: 'heading', tag: 'h3', children: [textNode(text)] })
export const ul = (...items: Inline[][]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((inline, i) => ({ ...base, type: 'listitem', value: i + 1, children: inline.map(textNode) })),
})
export const b = (text: string): Text => ({ text, bold: true })

type Node = { type: string; version: number; [k: string]: unknown }

export const doc = (...children: Node[]) => ({ root: { ...base, type: 'root', children } })
