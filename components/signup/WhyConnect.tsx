'use client';

/**
 * Flow A · A-06 · Why connect an exchange (step 5 of 6).
 * Canvas requirements: explain the connect step before the ask: how cashback works, that it's safe, no API keys.
 * 3-step visual (trade → volume tracked → cashback paid), safety line (TradeX never holds your funds or keys),
 * FAQ accordion, CTA "Connect exchange" with "Explore first" as the secondary (counts as skip).
 * Events: connect_explainer_viewed, connect_explainer_skipped.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepHeader, PrimaryButton, HelpButton, Callout, styles as s } from './parts';
import { SIGNUP_STEPS } from '@/lib/flow';
import { stepProps, track } from '@/lib/track';

const P = stepProps('why_connect');

const STEPS = [
  // Icons from the Figma icon library (12:339): Chart--candlestick, Data--view, Money.
  { icon: 'chart-candlestick', title: 'You trade', text: 'On Bitunix or Pionex, with an account opened through TradeX.' },
  { icon: 'data-view', title: 'We see your volume', text: 'The exchange tells TradeX how much you traded. Nothing else.' },
  { icon: 'money', title: 'You get paid back', text: 'Cashback lands every month, and your rank goes up.' }
];

const FAQ = [
  { q: 'Why does TradeX need an exchange?', a: 'TradeX doesn’t run trades itself. Your trades happen on the exchange, and TradeX uses your trading volume to pay cashback and move you up the ranks.' },
  { q: 'Is my money safe?', a: 'Your money stays on the exchange, in your own account. TradeX never holds your funds and never asks for API keys or passwords.' },
  { q: 'What does TradeX see?', a: 'Only the trading volume of the account you open through TradeX. It can’t trade, deposit or withdraw for you.' },
  { q: 'I already have a Bitunix or Pionex account.', a: 'Only accounts opened through TradeX earn cashback. On the next screen we show you the simplest way to get one.' },
  { q: 'How long does it take?', a: 'About 10 minutes, including the exchange’s ID check. We guide you through every step and save your progress.' }
];

export default function WhyConnect() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('signup_step_viewed', P);
    track('connect_explainer_viewed', P);
  }, []);

  const explore = () => {
    track('connect_explainer_skipped', P);
    router.push('/explore');
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={5} total={SIGNUP_STEPS} onBack={() => router.push('/plan')} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>Why connect an exchange?</h1>
            <p className={s.lead}>It’s how your trades turn into cashback and ranks.</p>
          </div>

          <ol className={s.flowSteps}>
            {STEPS.map((st, i) => (
              <li key={st.title} className={s.flowStep}>
                <div className={s.flowStepTop}>
                  <span className={s.iconTile}><Image src={`/signup/icons/${st.icon}.svg`} alt="" width={20} height={20} /></span>
                  <span className={s.flowStepNum}>{i + 1}</span>
                </div>
                <h2 className={s.welcomeCardTitle}>{st.title}</h2>
                <p className={s.welcomeCardText}>{st.text}</p>
              </li>
            ))}
          </ol>

          <Callout title="Your money stays on the exchange">TradeX never holds your funds and never asks for API keys.</Callout>

          <section className={s.planBlock} aria-labelledby="faq-title">
            <h2 id="faq-title" className={s.questionLabel}>Questions people ask</h2>
            <div className={s.faq}>
              {FAQ.map((f, i) => (
                <div key={f.q} className={s.faqItem}>
                  <button type="button" className={s.faqQ} aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                    {f.q}<span aria-hidden className={s.faqIcon}>{open === i ? '−' : '+'}</span>
                  </button>
                  {open === i && <p id={`faq-${i}`} className={s.faqA}>{f.a}</p>}
                </div>
              ))}
            </div>
          </section>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push('/exchange')}>Connect exchange</PrimaryButton>
            <button type="button" className={s.inlineLink} onClick={explore}>Explore first</button>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="why_connect">
        <h2>Still unsure?</h2>
        <p>Open the questions above, or ask the community on Discord. Connecting takes about 10 minutes and we guide you through it.</p>
      </HelpButton>
    </main>
  );
}
