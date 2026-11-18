/**
 * Prize pool rules (EU rules, compliance review Nov 2026). DRAFT for legal review: the leaderboard is a prize
 * competition, so it needs published conditions (eligibility, ranking, ties, payout, exclusions).
 * Linked from every Disclosure line (welcome, plan, why connect, choose exchange, paywalls).
 */
import Image from 'next/image';
import s from '@/components/signup/signup.module.css';

const SECTIONS: { title: string; items: string[] }[] = [
  { title: 'Who can take part', items: [
    'You’re 18 or older and have a TradeX account.',
    'You trade on an exchange account opened through TradeX, in a country where that exchange may serve you.',
    'You finished the exchange’s ID check.'
  ] },
  { title: 'How you rank', items: [
    'Each exchange has its own leaderboard.',
    'You rank by the trading volume of that account in the calendar month (UTC), as the exchange reports it to TradeX.'
  ] },
  { title: 'Prizes and payout', items: [
    'The pool and the prize for each place are shown on the leaderboard before the month starts.',
    'Traders with the same volume share the prizes of their places equally.',
    'Prizes are paid within 14 days after the month ends. How and in which asset is still to be confirmed.'
  ] },
  { title: 'Not allowed', items: [
    'More than one account per person, or trading against yourself to raise volume.',
    'We may remove anyone who breaks these rules or the exchange’s terms.'
  ] },
  { title: 'Before you trade for a prize', items: [
    'Crypto trading is high risk. You can lose all the money you invest.',
    'Trading more to climb the leaderboard can cost you more in fees and losses than any prize.',
    'Prizes may be taxable where you live.'
  ] }
];

export default function PrizePoolRules() {
  return (
    <main className={s.rulesPage}>
      <div>
        <div className={s.rulesContent}>
          <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} />
          <div className={s.intro}>
            <h1 className={s.title}>Prize pool rules</h1>
            <p className={s.lead}>How the monthly leaderboard works.</p>
          </div>
          {SECTIONS.map((sec) => (
            <section key={sec.title} className={s.planBlock}>
              <h2 className={s.questionLabel}>{sec.title}</h2>
              <ul className={s.rulesList}>{sec.items.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ))}
          <p className={s.hint}>Draft for legal review, November 2026.</p>
        </div>
      </div>
    </main>
  );
}
