'use client';

/**
 * Flow C · C-10 · Reactivation emails · D8, D14, D30 (days after signup; the trial ended on D7).
 * Canvas requirements: D8 your access is paused; D14 what you're missing (new courses, cashback); D30 last reminder.
 * Events: email_sent {reactivation_d8 | d14 | d30} (backend), email_clicked.
 * Every link opens the C-11 reactivation landing. Same mail frame as A-21, B-08 and C-06.
 */
import Image from 'next/image';
import { EXCHANGES } from '@/lib/exchanges';
import e from './emails.module.css';

const EMAILS = [
  { id: 'reactivation_d8', when: 'D8 · the day after the trial ends', subject: 'Your TradeX access is paused', cta: 'Open TradeX again' },
  { id: 'reactivation_d14', when: 'D14 · still not connected', subject: 'What you’re missing on TradeX', cta: 'Connect and come back' },
  { id: 'reactivation_d30', when: 'D30 · last reminder', subject: 'Your account is still here', cta: 'Connect your exchange' }
];

const link = (id: string) => `/resume?to=c-reactivate&email=${id}&utm_source=email&utm_campaign=${id}`;

export default function ReactivationEmails() {
  return (
    <main className={e.page}>
      <header className={e.head}>
        <p className={e.kicker}>C-10 · Reactivation emails · preview</p>
        <h1>Emails after the free trial ends</h1>
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
              {m.id === 'reactivation_d8' && (
                <>
                  <h2>Your access is paused</h2>
                  <p>Your free trial ended yesterday. Your account and everything you did in it are saved.</p>
                  <p>Connect an exchange account opened through TradeX and it all opens again, plus:</p>
                  <ul className={e.list}>
                    <li>Cashback on every trade</li>
                    <li>Your rank, starting as a Rekrut</li>
                    <li>Advanced courses, Level 3 and up</li>
                  </ul>
                  <p className={e.small}>Takes about 10 minutes. We guide every step.</p>
                </>
              )}
              {m.id === 'reactivation_d14' && (
                <>
                  <h2>What you’re missing on TradeX</h2>
                  <p>While your access is paused, the community keeps trading and learning:</p>
                  <ul className={e.list}>
                    <li>New course lessons every week</li>
                    <li>Daily live trading on Discord</li>
                    <li>Fresh market analyses every week</li>
                  </ul>
                  <p>And this month’s cashback pools:</p>
                  <div className={e.pools}>
                    {EXCHANGES.map((x) => (
                      <div key={x.id}><Image src={x.logo.src} alt="" width={x.logo.width * 0.8} height={x.logo.height * 0.8} /><b>{x.pool}</b><span>{x.name} pool</span></div>
                    ))}
                  </div>
                </>
              )}
              {m.id === 'reactivation_d30' && (
                <>
                  <h2>Your account is still here</h2>
                  <p>This is our last email about your trial. Your TradeX account stays open, with everything you did in it.</p>
                  <p>Whenever you’re ready, connect an exchange and you’re back in, with cashback and ranks from your first trade.</p>
                </>
              )}
              <a className={e.cta} href={link(m.id)}>{m.cta}</a>
              <hr />
              <p className={e.footer}>You get this email because you have a TradeX account. <a href="#">Unsubscribe</a></p>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}
