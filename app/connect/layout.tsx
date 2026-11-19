import { Suspense, type ReactNode } from 'react';
import ConnectFrame from '@/components/signup/ConnectFrame';

/** Keeps the background and exchange colour mounted across the connect steps (see ConnectFrame). */
export default function ConnectLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ConnectFrame>{children}</ConnectFrame>
    </Suspense>
  );
}
