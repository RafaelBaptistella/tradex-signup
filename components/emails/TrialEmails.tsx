'use client';

/**
 * Flow C · C-06 · Trial emails · D0, D5, D6.
 * Canvas requirements: D0 welcome + how to use the trial; D5 two days left; D6 tomorrow your access locks.
 * Events: email_sent {trial_d0 | trial_d5 | trial_d6} (backend), email_clicked.
 * D0 opens the trial dashboard (C-04); D5 and D6 open C's connect flow (C-12). Same mail frame as A-21 and B-08.
 */
import Image from 'next/image';
import { EXCHANGES } from '@/lib/exchanges';
import e from './emails.module.css';

const EMAILS = [
  { id: 'trial_d0', when: 'D0 · right after signup (trial day 1)', subject: 'Your 7 free days start now', cta: 'Start exploring', to: 'c-dashboard' },
  { id: 'trial_d5', when: 'D5 · not connected (trial day 6)', subject: 'Two days left in your free trial', cta: 'Connect your exchange', to: 'c-connect' },
  { id: 'trial_d6', when: 'D6 · not connected (last trial day)', subject: 'Tomorrow your access pauses', cta: 'Connect and keep access', to: 'c-connect' }
];

const link = (id: string, to: string) => `/resume?to=${to}&email=${id}&utm_source=email&utm_campaign=${id}`;

export default function TrialEmails() {
  return (
    <main className={e.page}>
      <header className={e.head}>
        <p className={e.kicker}>C-06 · Trial emails · preview</p>
        <h1>Emails during the 7-day free trial</h1>
      </header>

      <div className={e.grid}>
        {EMAILS.map((m) => (
          <section key={m.id} className={e.client} aria-label={m.when}>
            <p className={e.when}>{m.when}</p>
            <div className={e.meta}>
              <p><span>From</span>TradeX</p>
              <p><span>Subject</span>{m.subject}</p>
            </div>
            <article className={e.mail}>
              <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} />
              {m.id === 'trial_d0' && (
                <>
                  <div className={e.steps} aria-label="Day 1 of 7">{[1, 2, 3, 4, 5, 6, 7].map((d) => <span key={d} className={d === 1 ? e.on : ''} />)}</div>
                  <h2>Your 7 free days start now</h2>
                  <p>Courses Level 1 and 2, the community and the tools are open to you for 7 days. Three good places to start:</p>
                  <ol className={e.list}>
                    <li>Start the beginner course</li>
                    <li>Join the Discord for daily live trading</li>
                    <li>Read this week’s market analysis</li>
                  </ol>
                  <p>Cashback and ranks open when you connect an exchange account opened through TradeX. You can do it any time.</p>
                </>
              )}
              {m.id === 'trial_d5' && (
                <>
                  <div className={e.steps} aria-label="Day 6 of 7">{[1, 2, 3, 4, 5, 6, 7].map((d) => <span key={d} className={d < 6 ? e.done : d === 6 ? e.on : ''} />)}</div>
                  <h2>Two days left in your free trial</h2>
                  <p>After day 7, courses, community and tools pause until you connect an exchange.</p>
                  <p>Connect now and it all stays open, plus:</p>
                  <ul className={e.list}>
                    <li>Cashback on every trade</li>
                    <li>Your rank, starting as a Rekrut</li>
                    <li>Advanced courses, Level 3 and up</li>
                  </ul>
                  <p className={e.small}>Takes about 10 minutes. We guide every step.</p>
                </>
              )}
              {m.id === 'trial_d6' && (
                <>
                  <div className={e.steps} aria-label="Day 7 of 7">{[1, 2, 3, 4, 5, 6, 7].map((d) => <span key={d} className={d < 7 ? e.done : d === 7 ? e.on : ''} />)}</div>
                  <h2>Tomorrow your access pauses</h2>
                  <p>Today is the last day of your free trial. Connect an exchange now and nothing pauses: what you started stays open.</p>
                  <p>This month’s cashback pools:</p>
                  <div className={e.pools}>
                    {EXCHANGES.map((x) => (
                      <div key={x.id}><Image src={x.logo.src} alt="" width={x.logo.width * 0.8} height={x.logo.height * 0.8} /><b>{x.pool}</b><span>{x.name} pool</span></div>
                    ))}
                  </div>
                </>
              )}
              <a className={e.cta} href={link(m.id, m.to)}>{m.cta}</a>
              <hr />
              <p className={e.footer}>You get this email because you started a free trial on TradeX. <a href="#">Unsubscribe</a></p>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}
