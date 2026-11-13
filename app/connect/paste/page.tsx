import { Suspense } from 'react';
import PasteUid from '@/components/signup/PasteUid';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PasteUid />
    </Suspense>
  );
}
