import type { ReactNode } from 'react'

export function PublicPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <section className="border-b border-secondary-200 bg-white">
        <div className="container max-w-4xl py-12 md:py-16">
          {eyebrow && <p className="mb-3 text-sm font-medium text-primary-700">{eyebrow}</p>}
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900 md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary-600">{description}</p>
        </div>
      </section>
      <div className="container max-w-4xl py-12">{children}</div>
    </div>
  )
}
