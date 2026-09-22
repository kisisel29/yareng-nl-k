import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { recordSiteTraffic } from '../../lib/api';

function istanbulDayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function TrafficTracker() {
  const { pathname } = useLocation();
  const lastClickAt = useRef(0);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return;
    const key = `gs-visit:${istanbulDayKey()}:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    void recordSiteTraffic('visit');
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const actionable = event.target.closest('a, button, [role="button"]');
      if (!actionable) return;
      const now = Date.now();
      if (now - lastClickAt.current < 1500) return;
      lastClickAt.current = now;
      void recordSiteTraffic('click');
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
