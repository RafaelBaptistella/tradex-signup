'use client';

/** Flow B · B-05 · Shared connect flow: B reuses A's connect screens (A-07 to A-17), so it only marks the flow and hands over. */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setFlow } from '@/lib/track';

export default function Page() {
  const router = useRouter();
  useEffect(() => { setFlow('b'); router.replace('/exchange'); }, [router]);
  return null;
}
