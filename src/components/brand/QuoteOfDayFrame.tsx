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
        className="relative rounded-xl bg-white/75 px-5 py-5 sm:px-12 sm:py-6"
        style={{
          border: `1.5px solid ${FRAME_GREEN}`,
        }}
      >
        {/* Üst etiket — kenarı keser */}
        <div className="absolute left-[4.25rem] top-0 z-10 -translate-y-1/2 bg-[#F7F5F0] px-1.5 sm:left-28">
          <span
            className="inline-block rounded-md bg-white px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-900 sm:text-xs"
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
          className="pointer-events-none absolute -left-1 top-1/2 z-10 h-14 w-auto -translate-y-1/2 select-none sm:-left-2 sm:h-[4.75rem]"
        />

        {/* Açılış tırnağı */}
        <span
          className="absolute left-9 top-3 select-none font-serif text-2xl font-bold leading-none text-ink-900 sm:left-14 sm:top-4 sm:text-3xl"
          aria-hidden
        >
          «
        </span>

        {/* Kapanış tırnağı — sağ alt köşe */}
        <span
          className="absolute bottom-1.5 right-3 select-none bg-white px-1 font-serif text-2xl font-bold leading-none text-ink-900 sm:bottom-2 sm:right-5 sm:text-3xl"
          aria-hidden
        >
          »
        </span>

        <blockquote className="relative pl-12 pr-8 text-center sm:pl-16 sm:pr-12">
          <p className="font-hand text-[1.45rem] font-semibold leading-snug text-ink-900 sm:text-[1.75rem] sm:leading-snug">
            {text}
          </p>
          {attribution ? (
            <footer className="mt-2 text-right sm:mt-3">
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
