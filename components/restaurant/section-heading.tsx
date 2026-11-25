export function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <div className={light ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 font-display text-display-section font-bold text-warm sm:mt-4 sm:text-5xl">{title}</h2>{copy && <p className="mt-4 text-sm leading-6 text-white/55 sm:mt-5 sm:text-base sm:leading-7">{copy}</p>}</div>;
}
