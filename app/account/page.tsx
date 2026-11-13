import { Suspense } from 'react';
import CreateAccount from '@/components/signup/CreateAccount';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateAccount />
    </Suspense>
  );
}
