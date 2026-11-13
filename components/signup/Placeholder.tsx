'use client';

/** Stand-in for canvas screens not built yet, so the prototype can be clicked through in order. */
import { useRouter } from 'next/navigation';
import { StepHeader, PrimaryButton, styles as s } from './parts';
import { PLACEHOLDERS, SIGNUP_STEPS } from '@/lib/flow';

export default function Placeholder({ id }: { id: keyof typeof PLACEHOLDERS }) {
  const router = useRouter();
  const p = PLACEHOLDERS[id];
  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />
      <div className={s.centerMain}>
        {p.step ? <StepHeader step={p.step} total={SIGNUP_STEPS} onBack={() => router.back()} /> : <div />}
        <div className={s.centerContent}>
          <div className={s.centerIntro}>
            <p className={s.text}>{p.node} · not built yet</p>
            <h1 className={s.title}>{p.title}</h1>
          </div>
          <PrimaryButton onClick={() => router.push(p.next)}>Skip to the next screen</PrimaryButton>
        </div>
        <div className={s.spacer} aria-hidden />
      </div>
    </main>
  );
}
