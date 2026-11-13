'use client';

/**
 * Flow A · A-21 · Resume emails · 1h, 24h, 72h.
 * Canvas requirements: 1h "You're on step X of 5" + deep link; 24h help offer + video for that step;
 * 72h last nudge with a benefits recap. Events: signup_reminder_sent (backend), email_clicked {step}.
 * Preview page: shows the three emails for a chosen step and exchange, inside a simple mail frame.
 * The emails reuse the signup tokens (dark background, white CTA, accent #74d3fb); in production they need
 * email-safe HTML (tables, inline styles).
 */
import Image from 'next/image';
import { useState } from 'react';
import { EXCHANGES, type ExchangeId } from '@/lib/exchanges';
import { CONNECT_ROUTES, EMAILS, resumeLink, type EmailId } from '@/lib/resume';
import { HELP, type HelpStep } from '@/lib/help';
import e from './emails.module.css';

const HELP_KEY: HelpStep[] = ['connect_prepare', 'connect_open', 'connect_signup', 'connect_kyc', 'connect_find_uid', 'connect_uid'];

export default function ResumeEmails() {
  const [step, setStep] = useState(2);
  const [exId, setExId] = useState<ExchangeId>('bitunix');
  const ex = EXCHANGES.find((x) => x.id === exId)!;
  const here = CONNECT_ROUTES[step];
  const video = HELP[HELP_KEY[step]].video.replaceAll('{ex}', ex.name);
  const stepName = here.name.replace('the exchange', ex.name);

  return (
    <main className={e.page}>
      <header className={e.head}>
        <p className={e.kicker}>A-21 · Resume emails · preview</p>
        <h1>Emails for people who stop mid-connect</h1>
        <div className={e.controls}>
          <label>Stopped at
            <select value={step} onChange={(v) => setStep(+v.target.value)}>
              {CONNECT_ROUTES.map((r) => <option key={r.step} value={r.step}>{r.step ? `Step ${r.step} · ` : ''}{r.name}</option>)}
            </select>
          </label>
          <label>Exchange
            <select value={exId} onChange={(v) => setExId(v.target.value as ExchangeId)}>
              {EXCHANGES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
        </div>
      </header>

      <div className={e.grid}>
        {EMAILS.map((m) => (
          <section key={m.id} className={e.client} aria-label={m.delay}>
            <p className={e.when}>{m.delay}</p>
            <div className={e.meta}>
              <p><span>From</span>TradeX</p>
              <p><span>Subject</span>{subject(m.id, step, ex.name)}</p>
            </div>
            <article className={e.mail}>
              <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} />
              <Body id={m.id} step={step} stepName={stepName} exName={ex.name} video={video} />
              <a className={e.cta} href={resumeLink(m.id, step, ex.id)}>{cta(m.id, step)}</a>
              <p className={e.small}>We saved your progress. The link takes you back to this step.</p>
              <hr />
              <p className={e.footer}>You get this email because you started connecting {ex.name} on TradeX. <a href="#">Unsubscribe</a></p>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}

function subject(id: EmailId, step: number, ex: string) {
  if (id === 'connect_resume_1h') return step ? `You’re on step ${step} of 5` : `Ready to connect ${ex}?`;
  if (id === 'connect_resume_24h') return 'Need a hand with the next step?';
  return 'Your cashback is waiting';
}

function cta(id: EmailId, step: number) {
  if (id === 'connect_resume_24h') return 'Continue with help';
  return step ? `Continue at step ${step}` : 'Start connecting';
}

function Body({ id, step, stepName, exName, video }: { id: EmailId; step: number; stepName: string; exName: string; video: string }) {
  if (id === 'connect_resume_1h') {
    return (
      <>
        <h2>{step ? `You’re on step ${step} of 5` : 'You’re almost ready'}</h2>
        <p>You stopped at <b>{stepName}</b>. Pick up right where you left off: it only takes a few minutes.</p>
        <div className={e.steps} aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n < step ? e.done : n === step ? e.on : ''} />)}
        </div>
      </>
    );
  }
  if (id === 'connect_resume_24h') {
    return (
      <>
        <h2>Stuck on “{stepName}”?</h2>
        <p>Most questions on this step have a quick answer. Watch the short video, or ask our team on Discord.</p>
        <div className={e.video}><span aria-hidden>▶</span><div><b>{video}</b><small>Short video for this step</small></div></div>
        <p><a href="#">Talk to a person on Discord</a></p>
      </>
    );
  }
  return (
    <>
      <h2>Your cashback is still waiting</h2>
      <p>Connect your {exName} account opened through TradeX and you get:</p>
      <ul className={e.list}>
        <li>Cashback on every trade, paid monthly</li>
        <li>Your rank path, starting as a Rekrut</li>
        <li>All courses, the community and live trading</li>
      </ul>
      <p>This is our last reminder about connecting.</p>
    </>
  );
}
