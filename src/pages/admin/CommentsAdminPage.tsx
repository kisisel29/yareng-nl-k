import { useEffect, useMemo, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import {
  fetchAllContentComments,
  fetchNews,
  fetchPersonById,
  moderateContentComment,
  type ContentComment,
} from '../../lib/api';
import { NEWS_PAGE_PATH } from '../../lib/constants';
import { formatDateTimeTr, personName } from '../../lib/format';
import { btnPrimary, btnSecondary } from '../../lib/cn';
import type { NewsItem, Person } from '../../types';

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

type TargetMeta = {
  kind: 'news' | 'person' | 'other';
  label: string;
  href: string;
};

export function CommentsAdminPage() {
  const { notify } = useToast();
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [peopleById, setPeopleById] = useState<Record<string, Person>>({});
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const [nextComments, nextNews] = await Promise.all([
      fetchAllContentComments(),
      fetchNews({ includeUnpublished: true }),
    ]);
    setComments(nextComments);
    setNews(nextNews);

    const personIds = [
      ...new Set(
        nextComments
          .map((item) => item.target_key)
          .filter((key): key is string => Boolean(key?.startsWith('person:')))
          .map((key) => key.slice(7))
      ),
    ];
    if (personIds.length === 0) {
      setPeopleById({});
      return;
    }
    const rows = await Promise.all(personIds.map((id) => fetchPersonById(id).catch(() => null)));
    const map: Record<string, Person> = {};
    for (const person of rows) {
      if (person) map[person.id] = person;
    }
    setPeopleById(map);
  }

  useEffect(() => {
    reload()
      .catch(() => notify('Yorumlar yüklenemedi.', 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  const newsById = useMemo(() => {
    const map = new Map<string, NewsItem>();
    for (const item of news) map.set(item.id, item);
    return map;
  }, [news]);

  const visible = useMemo(() => {
    if (filter === 'all') return comments;
    return comments.filter((item) => item.status === filter);
  }, [comments, filter]);

  const pendingCount = comments.filter((item) => item.status === 'pending').length;

  function resolveTarget(targetKey?: string): TargetMeta {
    if (!targetKey) return { kind: 'other', label: 'İçerik', href: '/' };
    if (targetKey.startsWith('news:')) {
      const id = targetKey.slice(5);
      const item = newsById.get(id);
      return {
        kind: 'news',
        label: item?.title || 'Haber',
        href: item ? `${NEWS_PAGE_PATH}/${item.slug}` : NEWS_PAGE_PATH,
      };
    }
    if (targetKey.startsWith('person:')) {
      const id = targetKey.slice(7);
      const person = peopleById[id];
      return {
        kind: 'person',
        label: person ? personName(person) : 'Sima',
        href: person ? `/simalar/${person.slug}` : '/simalar',
      };
    }
    return { kind: 'other', label: targetKey, href: '/' };
  }

  async function act(comment: ContentComment, action: 'approve' | 'reject' | 'delete') {
    if (!comment.target_key) return;
    setBusyId(comment.id);
    try {
      await moderateContentComment(comment.target_key, comment.id, action);
      await reload();
      notify(
        action === 'approve' ? 'Yorum onaylandı.' : action === 'reject' ? 'Yorum reddedildi.' : 'Yorum silindi.',
        'success'
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'İşlem yapılamadı.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo title="Yorumlar" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Yorumlar</h1>
          <p className="mt-1 text-sm text-ink-500">
            Onay bekleyen yorumları inceleyin. Onaylanmadan sitede görünmez.
            {pendingCount > 0 ? ` (${pendingCount} bekleyen)` : ''}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['pending', 'Bekleyen'],
            ['approved', 'Onaylı'],
            ['rejected', 'Reddedilen'],
            ['all', 'Tümü'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? btnPrimary : btnSecondary}
            onClick={() => setFilter(value)}
          >
            {label}
            {value === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        {loading ? <p className="text-sm text-ink-500">Yükleniyor…</p> : null}
        {!loading && visible.length === 0 ? (
          <p className="text-sm text-ink-500">Bu filtrede yorum yok.</p>
        ) : null}
        <ul className="divide-y divide-cream-200">
          {visible.map((comment) => {
            const target = resolveTarget(comment.target_key);
            return (
              <li key={comment.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">
                      {comment.status === 'pending'
                        ? 'Bekliyor'
                        : comment.status === 'approved'
                          ? 'Onaylı'
                          : 'Reddedildi'}
                      {comment.created_at ? ` · ${formatDateTimeTr(comment.created_at)}` : ''}
                    </p>
                    <p className="mt-1 font-medium text-ink-900">{comment.name}</p>
                    <p className="mt-1 text-sm text-ink-600">
                      {target.kind === 'person' ? 'Sima' : target.kind === 'news' ? 'Haber' : 'İçerik'}:{' '}
                      <Link to={target.href} className="text-burgundy-700 hover:underline">
                        {target.label}
                      </Link>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comment.status !== 'approved' ? (
                      <button
                        type="button"
                        className={btnPrimary}
                        disabled={busyId === comment.id}
                        onClick={() => void act(comment, 'approve')}
                      >
                        <Check className="h-4 w-4" />
                        Onayla
                      </button>
                    ) : null}
                    {comment.status !== 'rejected' ? (
                      <button
                        type="button"
                        className={btnSecondary}
                        disabled={busyId === comment.id}
                        onClick={() => void act(comment, 'reject')}
                      >
                        <X className="h-4 w-4" />
                        Reddet
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={busyId === comment.id}
                      onClick={() => void act(comment, 'delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">{comment.body}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
