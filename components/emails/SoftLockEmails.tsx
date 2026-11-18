'use client';

/**
 * Flow B · B-08 · Emails · day 1 + day 3, for people who signed up but haven't connected an exchange.
 * Canvas requirements: D1 "You're in, one step left"; D3 "This month's prize pool is open" (was a cashback estimate; corrected).
 * Events: email_sent {softlock_d1 | softlock_d3} (backend), email_clicked. Links open B's connect flow.
 * Same mail frame and tokens as the A-21 resume emails.
 */
import Image from 'next/image';
import { EXCHANGES } from '@/lib/exchanges';
import e from './emails.module.css';
import { available, useEU } from '@/lib/compliance';
import { RULES_NOTE, footer, tag } from './rules';

const EMAILS = [
  { id: 'softlock_d1', when: '1 day after signup, not connected', subject: 'You’re in. One step left', cta: 'Connect your exchange' },
  { id: 'softlock_d3', when: '3 days after signup, not connected', subject: 'This month’s prize pool is open', cta: 'Join the leaderboard' }
];

const link = (id: string) => `/resume?to=b-connect&email=${id}&utm_source=email&utm_campaign=${id}`;

export default function SoftLockEmails() {
  const eu = useEU();
  return (
    <main className={e.page}>
      <header className={e.head}>
        <p className={e.kicker}>B-08 · Reminder emails · preview</p>
        <h1>Emails for people who haven’t connected yet</h1>
        {eu && <p className={e.rulesNote}>{RULES_NOTE}</p>}
      </header>

      <div className={`${e.grid} ${e.grid2}`}>
        {EMAILS.map((m) => (
          <section key={m.id} className={e.client} aria-label={m.when}>
            <p className={e.when}>{m.when}{eu && <span className={e.tag}>{tag(m.id)}</span>}</p>
            <div className={e.meta}>
              <p><span>From</span>TradeX</p>
              <p><span>Subject</span>{m.subject}</p>
            </div>
            <article className={e.mail}>
              <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} />
              {m.id === 'softlock_d1' ? (
                <>
                  <h2>You’re in. One step left</h2>
                  <p>Your TradeX account is ready: courses, community and live trading are open. The leaderboard and your ranks start once you connect an exchange account opened through TradeX.</p>
                  <ul className={e.list}>
                    <li>Takes about 10 minutes, and we guide every step</li>
                    <li>Your money stays on the exchange</li>
                  </ul>
                </>
              ) : (
                <>
                  <h2>This month’s prize pool is open</h2>
                  <p>Every trade on an exchange opened through TradeX counts for the leaderboard. Each month, the top traders share these prize pools:</p>
                  <div className={e.pools}>
                    {EXCHANGES.filter((x) => available(x.id, eu)).map((x) => (
                      <div key={x.id}><Image src={x.logo.src} alt="" width={x.logo.width * 0.8} height={x.logo.height * 0.8} /><b>{x.pool}</b><span>{x.name} pool</span></div>
                    ))}
                  </div>
                  <p>Connect now and your next trade already counts.</p>
                </>
              )}
              <a className={e.cta} href={link(m.id)}>{m.cta}</a>
              <hr />
              <p className={e.footer}>{eu ? footer(m.id) : <>You get this email because you signed up on TradeX.</>} <a href="#">Unsubscribe</a></p>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}
