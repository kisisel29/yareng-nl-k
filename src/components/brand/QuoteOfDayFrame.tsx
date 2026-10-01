const FRAME_GREEN = '#8BB381';

export function QuoteOfDayFrame({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <figure className="relative mx-auto w-full" aria-label="Günün sözü">
      <div
        className="relative rounded-xl bg-white/75 px-4 py-3 sm:px-10 sm:py-3.5"
        style={{
          border: `1.5px solid ${FRAME_GREEN}`,
        }}
      >
        {/* Üst etiket — kenarı keser */}
        <div className="absolute left-[3.75rem] top-0 z-10 -translate-y-1/2 bg-[#F7F5F0] px-1.5 sm:left-24">
          <span
            className="inline-block rounded-md bg-white px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-900 sm:text-xs"
            style={{ border: `1.5px solid ${FRAME_GREEN}` }}
          >
            Günün sözü
          </span>
        </div>

        {/* Sol tüy */}
        <img
          src="/quote-feather.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-1 top-1/2 z-10 h-12 w-auto -translate-y-1/2 select-none sm:-left-2 sm:h-14"
        />

        {/* Açılış tırnağı */}
        <span
          className="absolute left-8 top-2 select-none font-serif text-xl font-bold leading-none text-ink-900 sm:left-12 sm:top-2.5 sm:text-2xl"
          aria-hidden
        >
          «
        </span>

        {/* Kapanış tırnağı — sağ alt köşe */}
        <span
          className="absolute bottom-1 right-2.5 select-none bg-white px-0.5 font-serif text-xl font-bold leading-none text-ink-900 sm:bottom-1.5 sm:right-4 sm:text-2xl"
          aria-hidden
        >
          »
        </span>

        <blockquote className="relative pl-11 pr-7 text-left sm:pl-14 sm:pr-10">
          <p className="font-hand text-[1.35rem] font-semibold leading-tight text-ink-900 sm:text-[1.6rem] sm:leading-snug">
            {text}
          </p>
          {attribution ? (
            <footer className="mt-1 text-right sm:mt-1.5">
              <cite className="font-hand text-base not-italic text-ink-600 sm:text-lg">
                — {attribution}
              </cite>
            </footer>
          ) : null}
        </blockquote>
      </div>
    </figure>
  );
}
