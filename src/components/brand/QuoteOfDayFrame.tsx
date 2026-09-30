const FRAME_GREEN = '#8BB381';

export function QuoteOfDayFrame({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <figure
      className="relative mx-auto mt-6 w-full max-w-2xl px-2 sm:px-4"
      aria-label="Günün sözü"
    >
      <div
        className="relative rounded-2xl bg-white/70 px-4 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12"
        style={{
          border: `1.5px solid ${FRAME_GREEN}`,
        }}
      >
        {/* Üst etiket — kenarı keser */}
        <div className="absolute left-[4.5rem] top-0 z-10 -translate-y-1/2 bg-[#F7F5F0] px-1.5 sm:left-24">
          <span
            className="inline-block rounded-md bg-white px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-900 sm:text-xs"
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
          className="pointer-events-none absolute -left-1 top-1/2 z-10 h-[5.5rem] w-auto -translate-y-1/2 select-none sm:-left-3 sm:h-[7.5rem]"
        />

        {/* Açılış tırnağı */}
        <span
          className="absolute left-10 top-8 select-none font-serif text-3xl font-bold leading-none text-ink-900 sm:left-16 sm:top-10 sm:text-4xl"
          aria-hidden
        >
          «
        </span>

        {/* Kapanış tırnağı — sağ alt köşe */}
        <span
          className="absolute bottom-2 right-4 select-none bg-white px-1 font-serif text-3xl font-bold leading-none text-ink-900 sm:bottom-3 sm:right-6 sm:text-4xl"
          aria-hidden
          style={{ color: '#111110' }}
        >
          »
        </span>

        <blockquote className="relative mx-auto max-w-xl pl-10 pr-4 text-center sm:pl-14 sm:pr-8">
          <p className="font-hand text-[1.55rem] font-semibold leading-snug text-ink-900 sm:text-[1.9rem] sm:leading-snug">
            {text}
            {attribution ? (
              <>
                {' '}
                <cite className="not-italic text-ink-700">— {attribution}</cite>
              </>
            ) : null}
          </p>
        </blockquote>
      </div>
    </figure>
  );
}
