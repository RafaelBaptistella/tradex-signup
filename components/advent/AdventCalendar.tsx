'use client';

/**
 * Advent Calendar (new feature, wireframe, Nov 19, 2026). Lives in this prototype for now so César can see it next to
 * the signup test; it moves to its own codebase later.
 * Asana brief, translated from German: new platform page "TRADEX ADVENT CALENDAR", sponsored by Kraken.
 * Subheadline: "Draw your ticket every day for a chance at daily prizes!" Date (XX.XX.XXXX), the prize asset to win,
 * CTA "Join now". The requirement is a Kraken account connected to TradeX: without it, a popup asks to connect;
 * once someone took the ticket, it must show they're in the pot.
 * Prizes aren't known yet, so the 24 cards are placeholders by prize type; day 1 shows a drawn example (Ethereum).
 * Prototype: ?today=1–24 sets the current day (default 4), ?kraken=1 starts with Kraken connected, ?ticket=1 with today's ticket taken.
 */
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/track';
import p from '@/components/paywall/paywall.module.css';
import a from './advent.module.css';

type Kind = 'crypto' | 'merch' | 'voucher' | 'course' | 'mystery' | 'grand';
type Tone = 'violet' | 'ink' | 'light' | 'blue';
type Look = 'stripes' | 'dots' | 'zigzag' | 'grid' | 'rings' | 'plain';
/** tone: which corner the lantern comes from. look: kept from the first wireframe, not used for styling any more. */
type Day = { day: number; area: [number, number, number, number]; kind: Kind; tone: Tone; look: Look; word?: string };

/** Bento: 8 columns × 5 rows, every cell used once. area = [row, column, rows, columns]. */
const DAYS: Day[] = [
  { day: 1, area: [1, 1, 2, 2], kind: 'crypto', tone: 'violet', look: 'rings' },
  { day: 2, area: [1, 3, 1, 1], kind: 'merch', tone: 'light', look: 'dots' },
  { day: 3, area: [1, 4, 2, 1], kind: 'voucher', tone: 'ink', look: 'zigzag' },
  { day: 4, area: [1, 5, 1, 2], kind: 'crypto', tone: 'blue', look: 'stripes' },
  { day: 5, area: [1, 7, 1, 1], kind: 'course', tone: 'ink', look: 'grid' },
  { day: 6, area: [1, 8, 2, 1], kind: 'mystery', tone: 'violet', look: 'stripes', word: 'Nikolaus' },
  { day: 7, area: [2, 3, 1, 1], kind: 'voucher', tone: 'violet', look: 'dots' },
  { day: 8, area: [2, 5, 2, 1], kind: 'merch', tone: 'light', look: 'zigzag' },
  { day: 9, area: [2, 6, 1, 2], kind: 'crypto', tone: 'ink', look: 'rings' },
  { day: 10, area: [3, 1, 2, 1], kind: 'course', tone: 'blue', look: 'grid' },
  { day: 11, area: [3, 2, 1, 2], kind: 'mystery', tone: 'ink', look: 'plain', word: 'Lucky draw' },
  { day: 12, area: [3, 4, 1, 1], kind: 'crypto', tone: 'light', look: 'stripes', word: 'Halfway' },
  { day: 13, area: [3, 6, 1, 1], kind: 'voucher', tone: 'violet', look: 'zigzag' },
  { day: 14, area: [3, 7, 1, 2], kind: 'merch', tone: 'blue', look: 'dots' },
  { day: 15, area: [4, 2, 1, 1], kind: 'course', tone: 'ink', look: 'stripes' },
  { day: 16, area: [4, 3, 1, 2], kind: 'crypto', tone: 'violet', look: 'grid' },
  { day: 17, area: [4, 5, 1, 1], kind: 'mystery', tone: 'light', look: 'rings' },
  { day: 18, area: [4, 6, 1, 2], kind: 'voucher', tone: 'ink', look: 'zigzag' },
  { day: 19, area: [4, 8, 1, 1], kind: 'merch', tone: 'violet', look: 'dots' },
  { day: 20, area: [5, 1, 1, 1], kind: 'course', tone: 'light', look: 'grid' },
  { day: 21, area: [5, 2, 1, 1], kind: 'crypto', tone: 'blue', look: 'rings' },
  { day: 22, area: [5, 3, 1, 2], kind: 'mystery', tone: 'ink', look: 'stripes' },
  { day: 23, area: [5, 5, 1, 1], kind: 'voucher', tone: 'violet', look: 'plain' },
  { day: 24, area: [5, 6, 1, 3], kind: 'grand', tone: 'violet', look: 'rings', word: 'Grand prize' }
];

const KIND_LABEL: Record<Kind, string> = { crypto: 'Crypto', merch: 'Merch', voucher: 'Fee voucher', course: 'Course', mystery: 'Surprise', grand: 'Grand prize' };
/** Wireframe: the prizes aren't decided. Day 1 is the drawn example. */
const DRAWN: Record<number, { prize: string; detail: string; winner: string }> = {
  1: { prize: '0.25 ETH', detail: 'Ethereum', winner: 'alex_k***' },
  2: { prize: 'Prize TBA', detail: 'Merch pack', winner: 'mara***' },
  3: { prize: 'Prize TBA', detail: 'Fee voucher', winner: 'jonas_t***' }
};

const DRAW_HOUR = 18; // daily draw, announced live by Tim
const pad = (n: number) => String(n).padStart(2, '0');

export default function AdventCalendar() {
  const params = useSearchParams();
  const today = Math.min(24, Math.max(1, Number(params.get('today')) || 4));
  const [kraken, setKraken] = useState(params.get('kraken') === '1');
  const [ticket, setTicket] = useState(params.get('ticket') === '1');
  const [ask, setAsk] = useState(false);
  const [left, setLeft] = useState(0);

  useEffect(() => { track('advent_viewed', { day: today, kraken_connected: kraken }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const tick = () => {
      const now = new Date(); const next = new Date(now); next.setHours(DRAW_HOUR, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      setLeft(Math.floor((next.getTime() - now.getTime()) / 1000));
    };
    tick(); const t = window.setInterval(tick, 1000); return () => window.clearInterval(t);
  }, []);
  const clock = useMemo(() => [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60], [left]);

  const join = () => {
    if (!kraken) { track('advent_connect_prompt_viewed', { day: today }); setAsk(true); return; }
    track('advent_ticket_taken', { day: today });
    setTicket(true);
  };
  const connect = () => {
    // The Kraken connect flow isn't designed yet; the prototype marks Kraken as connected and takes the ticket.
    track('advent_kraken_connect_started', { day: today });
    setKraken(true); setAsk(false); setTicket(true);
  };
  const tickets = (today - 1 > 0 && kraken ? Math.min(2, today - 1) : 0) + (ticket ? 1 : 0);

  return (
    <div className={a.page}>
      <header className={a.head}>
        <div className={a.headText}>
          <p className={a.sponsor}>Sponsored by <KrakenMark /></p>
          <h1 className={a.title}>TradeX Advent Calendar</h1>
          <p className={a.sub}>Draw your ticket every day for a chance at daily prizes. 1 to 24 December 2026.</p>
        </div>
        {/* Everything about the draw in one place: when it happens, where it's announced, and the way in. */}
        <div className={a.drawBox}>
          <div className={a.countdown} aria-label={`Next draw in ${clock[0]} hours ${clock[1]} minutes`}>
            <span className={a.countLabel}>Next draw in</span>
            <div className={a.countBoxes}>
              {(['Hours', 'Minutes', 'Seconds'] as const).map((u, i) => (
                <span key={u} className={a.countBox}><b>{pad(clock[i])}</b><small>{u}</small></span>
              ))}
            </div>
          </div>
          <div className={a.liveRow}>
            <span className={a.live}><span className={a.liveDot} aria-hidden />Tim announces the winner live at {DRAW_HOUR}:00 CET</span>
            <a className={a.liveBtn} href="#" onClick={(e) => { e.preventDefault(); track('advent_stream_clicked', { day: today }); }}>Watch the stream</a>
          </div>
        </div>
      </header>

      {/* The Kraken requirement: a full-width banner (the dashboard banner pattern), not a tile. */}
      <section className={`${a.banner} ${kraken ? a.bannerOn : ''}`} aria-label="Your participation">
        <span className={a.bannerIcon} aria-hidden>{kraken ? <TicketIcon /> : <KrakenGlyph />}</span>
        {kraken ? (
          <p className={a.bannerText}>
            <b>{ticket ? `You’re in the pot for day ${today}` : `Kraken connected. Day ${today} is open.`}</b>
            <span>{ticket ? `Ticket #0${420 + today} · ${tickets} ticket${tickets === 1 ? '' : 's'} this month · Winner announced at ${DRAW_HOUR}:00` : 'Take your free ticket for today’s draw.'}</span>
          </p>
        ) : (
          <p className={a.bannerText}>
            <b>Connect your Kraken account to take part</b>
            <span>Only members with Kraken connected to TradeX get a daily ticket.</span>
          </p>
        )}
        {kraken
          ? (ticket ? <span className={a.inPot}><span className={a.okDot} aria-hidden />In the pot</span> : <button type="button" className={a.bannerBtn} onClick={join}>Join now</button>)
          : <button type="button" className={a.bannerBtn} onClick={() => { track('advent_connect_banner_clicked', { day: today }); setAsk(true); }}>Connect Kraken</button>}
      </section>


      <ol className={a.bento} aria-label="24 days of draws">
        {DAYS.map((d) => {
          const state = d.day < today ? 'past' : d.day === today ? 'today' : 'future';
          const drawn = DRAWN[d.day];
          return (
            <li key={d.day} style={{ gridArea: `${d.area[0]} / ${d.area[1]} / span ${d.area[2]} / span ${d.area[3]}` }}
              className={`${a.cell} ${a['tone_' + d.tone]} ${a['state_' + state]} ${d.area[2] * d.area[3] >= 3 ? a.big : ''} ${d.area[3] >= 2 ? a.wide : ''} ${d.word ? a.hasWord : ''}`}>
              <span className={a.num}>{d.day}</span>
              {state === 'future' && (
                <>
                  {d.word && <span className={a.word}>{d.word}</span>}
                  <span className={a.icon} aria-hidden><KindIcon kind={d.kind} /></span>
                  <span className={a.hint}>Opens {d.day} Dec</span>
                </>
              )}
              {state === 'past' && (
                <>
                  <span className={a.drawnTag}><svg viewBox="0 0 16 16" width="10" height="10" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Drawn</span>
                  {d.kind === 'crypto' && d.day === 1 ? <span className={`${a.icon} ${a.iconLarge}`} aria-hidden><EthIcon /></span> : <span className={a.icon} aria-hidden><KindIcon kind={d.kind} /></span>}
                  <span className={a.prize}><b>{drawn?.prize ?? 'Prize TBA'}</b>{drawn?.detail ?? KIND_LABEL[d.kind]}</span>
                  <span className={a.winner}>Won by {drawn?.winner ?? '***'}</span>
                </>
              )}
              {state === 'today' && (
                <>
                  <span className={a.todayTag}>Today</span>
                  <span className={a.icon} aria-hidden><KindIcon kind={d.kind} /></span>
                  <span className={a.todayRow}>
                    <span className={a.prize}><b>{KIND_LABEL[d.kind]}</b>Revealed at {DRAW_HOUR}:00</span>
                    {ticket
                      ? <span className={a.inPotSmall}><TicketIcon />You’re in</span>
                      : <button type="button" className={a.cellBtn} onClick={join}>Join now</button>}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className={a.legend} aria-hidden>
        <span><i className={a.legendDrawn} />Drawn</span>
        <span><i className={a.legendToday} />Today</span>
        <span><i className={a.legendNext} />Coming up</span>
      </div>

      {ask && (
        <div className={p.overlay} onClick={(e) => { if (e.target === e.currentTarget) setAsk(false); }}>
          <div className={`${p.card} ${a.krakenCard}`} role="dialog" aria-modal="true" aria-labelledby="kraken-title">
            <div className={p.spot} aria-hidden />
            <div className={p.top}>
              <button type="button" className={p.close} onClick={() => setAsk(false)} aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
              <span className={p.label}>Advent Calendar · Day {today}</span>
              <span className={p.topSpacer} aria-hidden />
            </div>
            <div className={p.body}>
              <div className={p.pitch}>
                <div className={a.modalArt} aria-hidden><KrakenMark big /></div>
                <div className={p.head}>
                  <h2 id="kraken-title" className={p.title}>Connect Kraken to take your ticket</h2>
                  <p className={p.lead}>The Advent Calendar is sponsored by Kraken. A Kraken account connected to TradeX gets you a free ticket every day.</p>
                </div>
              </div>
              <div className={p.decide}>
                <ul className={p.list}>
                  {['A ticket for today’s draw, and one every day until the 24th', 'Daily prizes, from crypto to merch', 'Winners announced live by Tim'].map((t, i) => (
                    <li key={t}><span className={`${p.tile} ${a.tileKraken}`}><Image src={`/signup/icons/${['trophy', 'money', 'forum'][i]}.svg`} alt="" width={16} height={16} /></span><span className={p.itemText}>{t}</span></li>
                  ))}
                </ul>
                <div className={p.actions}>
                  <button type="button" className={`${p.cta} ${p.ctaEx} ${a.exKraken}`} onClick={connect}>Connect Kraken</button>
                  <button type="button" className={p.secondary} onClick={() => setAsk(false)}>Not now</button>
                </div>
                <div className={p.footer}><span>Already have Kraken? Connect it in about 2 minutes. New to Kraken? We guide you.</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KrakenGlyph() {
  return <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3C7.6 3 4 6.6 4 11v6.2c0 .9 1.1 1.4 1.8.7l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.4.4 1 .4 1.4 0l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.4.4 1 .4 1.4 0l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.7.7 1.8.2 1.8-.7V11c0-4.4-3.6-8-8-8Zm-3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" fill="currentColor" /></svg>;
}

/** Placeholder until the Kraken logo comes from Figma. */
function KrakenMark({ big }: { big?: boolean }) {
  return (
    <span className={`${a.kraken} ${big ? a.krakenBig : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3C7.6 3 4 6.6 4 11v6.2c0 .9 1.1 1.4 1.8.7l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.4.4 1 .4 1.4 0l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.4.4 1 .4 1.4 0l.9-.9c.4-.4 1-.4 1.4 0l.9.9c.7.7 1.8.2 1.8-.7V11c0-4.4-3.6-8-8-8Zm-3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" fill="currentColor" /></svg>
      kraken
    </span>
  );
}

function EthIcon() {
  // Outline, same stroke as the other prize icons.
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return <svg viewBox="0 0 24 24"><path d="M12 2.5 5.5 12.6 12 16.4l6.5-3.8z" {...s} /><path d="M5.5 14.2 12 21.5l6.5-7.3L12 18z" {...s} /><path d="M12 2.5v13.9" {...s} /></svg>;
}

function TicketIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 6v12" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" /></svg>;
}

/** Wireframe icons per prize type. */
function KindIcon({ kind }: { kind: Kind }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'crypto') return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" {...s} /><path d="M9.5 8h4a2 2 0 0 1 0 4h-4m0 0h4.5a2 2 0 0 1 0 4h-4.5V8m1.5-2v2m0 8v2" {...s} /></svg>;
  if (kind === 'merch') return <svg viewBox="0 0 24 24"><path d="M8 4l-4 3 2 4 2-1v10h8V10l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z" {...s} /></svg>;
  if (kind === 'voucher') return <svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" {...s} /><path d="M9 14l6-6M9.5 9h.01M14.5 14h.01" {...s} /></svg>;
  if (kind === 'course') return <svg viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5z" {...s} /><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6" {...s} /></svg>;
  if (kind === 'grand') return <svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" {...s} /></svg>;
  return <svg viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11" rx="1.5" {...s} /><path d="M2.5 9h19v-3h-19zM12 6v14M12 6c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1" {...s} /></svg>;
}
