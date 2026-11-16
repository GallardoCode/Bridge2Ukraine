import type { ButtonAppearance } from '@/fields/link'

export type ButtonProps = {
  label?: string | null
  url?: string | null
  appearance?: ButtonAppearance | null
  newTab?: boolean | null
}

const classNames: Record<ButtonAppearance, string> = {
  primary: 'btn-primary',
  yellow: 'btn-primary yellow-btn',
  white: 'btn-primary white-btn',
  outline: 'btn-outline',
}

export const Button = ({ label, url, appearance, newTab }: ButtonProps) => {
  if (!label || !url) return null
  return (
    <a
      href={url}
      className={classNames[appearance ?? 'primary']}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  )
}

export const Buttons = ({ buttons }: { buttons?: (ButtonProps & { id?: string | null })[] | null }) => {
  if (!buttons?.length) return null
  return (
    <div className="bank-action-buttons stacked-buttons">
      {buttons.map((b, i) => (
        <Button key={b.id ?? i} {...b} />
      ))}
    </div>
  )
}
