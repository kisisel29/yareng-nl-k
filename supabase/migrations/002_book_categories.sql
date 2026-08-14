-- İsmail Hayal, Gümüşhaneli Simalar kitabındaki bölümler
-- Mevcut projede 001 zaten çalıştıysa bu dosyayı SQL Editor'de çalıştırın.

insert into public.categories (name, slug, description, sort_order) values
  ('Akademisyenler', 'akademisyenler', 'Akademisyenler', 1),
  ('Allah Dostları', 'allah-dostlari', 'Allah Dostları', 2),
  ('Asker ve Emniyetçiler', 'asker-ve-emniyetciler', 'Asker ve Emniyetçiler', 3),
  ('Belediye Başkanları', 'belediye-baskanlari', 'Belediye Başkanları', 4),
  ('Bürokratlar', 'burokratlar', 'Bürokratlar', 5),
  ('Doktorlar', 'doktorlar', 'Doktorlar', 6),
  ('Gazeteciler', 'gazeteciler', 'Gazeteciler', 7),
  ('Gönül Erleri', 'gonul-erleri', 'Gönül Erleri', 8),
  ('Hukukçular', 'hukukcular', 'Hukukçular', 9),
  ('İş İnsanları', 'is-insanlari', 'İş İnsanları', 10),
  ('Renkli ve Tarihi Simalar', 'renkli-ve-tarihi-simalar', 'Renkli ve Tarihi Simalar', 11),
  ('Sanatçılar', 'sanatcilar', 'Sanatçılar', 12),
  ('Siyasetçiler', 'siyasetciler', 'Siyasetçiler', 13),
  ('Sporcular', 'sporcular', 'Sporcular', 14),
  ('STK ve Dernek Başkanları', 'stk-ve-dernek-baskanlari', 'STK ve Dernek Başkanları', 15),
  ('Şair, Yazar ve Aşıklar', 'sair-yazar-ve-asiklar', 'Şair, Yazar ve Aşıklar', 16),
  ('Şehitlerimiz', 'sehitlerimiz', 'Şehitlerimiz', 17),
  ('Unutulmaz Eğitimciler', 'unutulmaz-egitimciler', 'Unutulmaz Eğitimciler', 18),
  ('Gümüşhane''de İz Bırakanlar', 'gumushane-de-iz-birakanlar', 'Gümüşhane''de İz Bırakanlar', 19)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order;

update public.people p
set category_id = c.id
from public.categories c
where p.slug = 'ornek-sima-1'
  and c.slug = 'renkli-ve-tarihi-simalar';

update public.people p
set category_id = c.id
from public.categories c
where p.slug = 'ornek-sima-2'
  and c.slug = 'unutulmaz-egitimciler';

-- Eski genel kategorileri, kimse bağlı değilse kaldır
delete from public.categories
where slug in (
  'egitim', 'bilim', 'sanat', 'edebiyat', 'siyaset', 'burokrasi',
  'is-dunyasi', 'spor', 'din', 'askeri', 'kultur', 'yerel-degerler', 'diger'
)
and not exists (
  select 1 from public.people p where p.category_id = categories.id
);
