'use client';

/** Flow C · C-12 · Shared connect flow: C reuses A's connect screens (A-07 to A-17), so it only marks the flow and hands over. */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setFlow } from '@/lib/track';

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    setFlow('c');
    const ex = new URLSearchParams(window.location.search).get('exchange');
    router.replace(ex ? `/exchange?pick=${ex}` : '/exchange');
  }, [router]);
  return null;
}
