'use client';

/** Flow C · C-12 · Shared connect flow: C reuses A's connect screens (A-07 to A-17), so it only marks the flow and hands over. */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setFlow } from '@/lib/track';

export default function Page() {
  const router = useRouter();
  useEffect(() => { setFlow('c'); router.replace('/exchange'); }, [router]);
  return null;
}
