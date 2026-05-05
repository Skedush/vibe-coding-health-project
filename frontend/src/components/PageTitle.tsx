interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-base text-gray-500 mt-2">{subtitle}</div>}
    </div>
  )
}
