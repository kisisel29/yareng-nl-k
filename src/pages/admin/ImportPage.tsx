import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { fetchCategories } from '../../lib/api';
import { createPerson } from '../../lib/admin';
import { CSV_TEMPLATE, csvRowToFormValues, parsePeopleCsv } from '../../lib/csv';
import { btnPrimary, btnSecondary } from '../../lib/cn';
import type { Category } from '../../types';

export function ImportPage() {
  const { notify } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parsePeopleCsv(String(reader.result));
        setRows(parsed);
        setResult(null);
      } catch (error) {
        notify(error instanceof Error ? error.message : 'CSV okunamadı.', 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  async function importRows() {
    setImporting(true);
    let ok = 0;
    let fail = 0;
    for (const row of rows) {
      try {
        const values = csvRowToFormValues(row, categories);
        if (!values.first_name || !values.last_name) {
          fail += 1;
          continue;
        }
        await createPerson(values);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setResult({ ok, fail });
    setImporting(false);
    notify(`${ok} kayıt içeri aktarıldı.`, fail ? 'info' : 'success');
  }

  function downloadTemplate() {
    const blob = new Blob([`\uFEFF${CSV_TEMPLATE}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simalar-sablon.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Seo title="CSV içeri aktar" noindex />
      <h1 className="font-serif text-3xl text-ink-900">CSV'den İçeri Aktar</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Sütunlar: ad, soyad, tam_ad, slug, dogum_tarihi, olum_tarihi, dogum_yeri, ilce, meslek, unvan,
        kategori, kisa_biyografi, uzun_biyografi, kaynak_yazar, kaynak_kitap, kaynak_yil, kaynak_sayfa.
        Kayıtlar taslak olarak eklenir.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={btnSecondary} onClick={downloadTemplate}>
          Şablon indir
        </button>
        <label className={`${btnSecondary} cursor-pointer`}>
          CSV seç
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {rows.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm text-ink-600">{rows.length} satır okundu.</p>
          <button type="button" className={`${btnPrimary} mt-4`} disabled={importing} onClick={() => void importRows()}>
            {importing ? 'Aktarılıyor…' : 'İçeri aktar'}
          </button>
        </div>
      ) : null}
      {result ? (
        <p className="mt-4 text-sm">
          {result.ok} başarılı, {result.fail} başarısız.
        </p>
      ) : null}
      <p className="mt-8 text-sm">
        <Link to="/admin/simalar" className="text-burgundy-700">
          Simalar listesine dön
        </Link>
      </p>
    </>
  );
}
