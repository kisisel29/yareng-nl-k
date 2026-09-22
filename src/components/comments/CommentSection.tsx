import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  fetchContentComments,
  submitContentComment,
  type ContentComment,
} from '../../lib/api';
import { formatDateTimeTr } from '../../lib/format';
import { btnPrimary, inputClass, labelClass } from '../../lib/cn';

function newCaptcha() {
  return {
    a: Math.floor(Math.random() * 9) + 1,
    b: Math.floor(Math.random() * 9) + 1,
  };
}

export function CommentSection({ targetKey }: { targetKey: string }) {
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [answer, setAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captcha, setCaptcha] = useState(newCaptcha);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchContentComments(targetKey)
      .then((items) => {
        if (active) setComments(items);
      })
      .catch(() => {
        if (active) setComments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [targetKey]);

  const remaining = useMemo(() => Math.max(0, 500 - body.length), [body.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const parsed = Number(answer.trim());
    if (!name.trim() || name.trim().length < 2) {
      setError('İsim en az 2 karakter olmalı.');
      return;
    }
    if (!body.trim() || body.trim().length < 3) {
      setError('Yorumunuz çok kısa.');
      return;
    }
    if (body.trim().length > 500) {
      setError('Yorum en fazla 500 karakter olabilir.');
      return;
    }
    if (!Number.isFinite(parsed)) {
      setError('Doğrulama sonucunu yazın.');
      return;
    }

    setSaving(true);
    try {
      const created = await submitContentComment({
        key: targetKey,
        name,
        body,
        a: captcha.a,
        b: captcha.b,
        answer: parsed,
        honeypot,
      });
      if (!honeypot.trim()) {
        setComments((current) => [created, ...current]);
      }
      setName('');
      setBody('');
      setAnswer('');
      setHoneypot('');
      setCaptcha(newCaptcha());
      setSuccess('Yorumunuz yayınlandı.');
    } catch (err) {
      setCaptcha(newCaptcha());
      setAnswer('');
      setError(err instanceof Error ? err.message : 'Yorum gönderilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12 border-t border-cream-200 pt-8">
      <h2 className="font-serif text-2xl text-ink-900">Son Yorumlar</h2>

      <form className="relative mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <label className="block">
          <span className={labelClass}>İsim*</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İsminizi Yazabilirsiniz"
            maxLength={60}
            required
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className={labelClass}>Yorum Yazın (500 Karakter)</span>
          <textarea
            className={`${inputClass} min-h-[8rem]`}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 500))}
            placeholder="Yorumunuzu yazın..."
            maxLength={500}
            required
          />
          <span className="mt-1 block text-xs text-ink-500">{remaining} karakter kaldı</span>
        </label>

        {/* Bot tuzak alanı — görünmez */}
        <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>

        <label className="block max-w-xs">
          <span className={labelClass}>
            Doğrulama: {captcha.a} + {captcha.b} = ?
          </span>
          <input
            className={inputClass}
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/[^\d-]/g, ''))}
            inputMode="numeric"
            placeholder="Sonuç"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        {success ? <p className="text-sm text-ink-700">{success}</p> : null}

        <div className="flex justify-end">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? 'Gönderiliyor…' : 'GÖNDER'}
          </button>
        </div>
      </form>

      <div className="mt-10 space-y-6">
        {loading ? <p className="text-sm text-ink-500">Yorumlar yükleniyor…</p> : null}
        {!loading && comments.length === 0 ? (
          <p className="text-sm text-ink-500">Henüz yorum yok. İlk yorumu siz yazın.</p>
        ) : null}
        {comments.map((comment) => (
          <article key={comment.id} className="border-t border-cream-200 pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-ink-900">{comment.name}</p>
              {comment.created_at ? (
                <p className="text-xs text-ink-500">{formatDateTimeTr(comment.created_at)}</p>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">{comment.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
