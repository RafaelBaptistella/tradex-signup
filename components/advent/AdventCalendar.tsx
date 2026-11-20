'use client';

/**
 * Advent Calendar (new feature, wireframe). Lives in this prototype for now so César can see it next to
 * the signup test; it moves to its own codebase later.
 * Asana brief, translated from German: new platform page "TRADEX ADVENT CALENDAR", sponsored by Kraken.
 * Subheadline: "Draw your ticket every day for a chance at daily prizes!" Date (XX.XX.XXXX), the prize asset to win,
 * CTA "Join now". The requirement is a Kraken account connected to TradeX: without it, a popup asks to connect;
 * once someone took the ticket, it must show they're in the pot.
 * Nov 20, 2026: calmer. Coming-up days show only their number; hovering a day shows its prize in a tooltip that follows
 * the cursor. The live stream gets a small thumbnail (playing while live) next to the countdown, and the Kraken
 * requirement moves under the calendar. Kraken logo and purple (#7132F5) from kraken.com.
 * Prototype: ?today=1–24 (default 4), ?kraken=1 Kraken connected, ?ticket=1 ticket taken, ?live=0 stream off air (live by default),
 * ?layout=grid equal cards instead of the bento, ?layout=carousel the V3 carousel.
 * Events: advent_viewed, advent_day_hovered {day, state}, advent_stream_clicked, advent_ticket_taken,
 * advent_connect_prompt_viewed, advent_connect_banner_clicked, advent_kraken_connect_started.
 */
import Image from 'next/image';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/track';
import p from '@/components/paywall/paywall.module.css';
import { DAYS, DRAW_HOUR, KIND_LABEL, WINNERS, adventToday, pad, useDrawCountdown, type Day, type Kind } from './adventData';
import AdventCarousel from './AdventCarousel';
import a from './advent.module.css';

type Tip = { day: Day; state: 'past' | 'today' | 'future'; x: number; y: number };

export default function AdventCalendar() {
  const params = useSearchParams();
  const today = adventToday(params.get('today'));
  const equal = params.get('layout') === 'grid';
  const carousel = params.get('layout') === 'carousel';
  const [kraken, setKraken] = useState(params.get('kraken') === '1');
  const [ticket, setTicket] = useState(params.get('ticket') === '1');
  const [ask, setAsk] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const hovered = useRef(0);
  const clock = useDrawCountdown();
  const liveNow = params.get('live') !== '0';

  useEffect(() => { track('advent_viewed', { day: today, kraken_connected: kraken, layout: carousel ? 'carousel' : equal ? 'grid' : 'bento' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  const stateOf = (d: Day) => (d.day < today ? 'past' : d.day === today ? 'today' : 'future') as Tip['state'];

  const move = (e: MouseEvent<HTMLLIElement>, d: Day) => {
    const state = stateOf(d);
    if (hovered.current !== d.day) { hovered.current = d.day; track('advent_day_hovered', { day: d.day, state }); }
    setTip({ day: d, state, x: e.clientX, y: e.clientY });
  };

  return (
    <div className={a.page}>
      <header className={a.head}>
        <div className={a.headText}>
          <p className={a.sponsor}>Sponsored by <Image src="/advent/kraken-logo-white.svg" alt="Kraken" width={84} height={13} /></p>
          <h1 className={a.title}>TradeX Advent Calendar</h1>
          <p className={a.sub}>Draw your ticket every day for a chance at daily prizes.<br />24 days, 24 prizes, one draw a day live at {DRAW_HOUR}:00 CET.</p>
        </div>

        {/* Nov 20, 2026: the live draw as a media card (thumbnail, what's on, one button), like the "Continue watching" card.
            Live by default in the prototype; ?live=0 shows the off-air state, which links to the channel. */}
        <section className={`${a.stream} ${liveNow ? a.streamLive : ''}`} aria-label="Live draw">
          <span className={a.thumb}>
            <Image className={a.thumbImg} src="/advent/stream-thumb.jpg" alt="" fill sizes="240px" />
            {liveNow
              ? <><span className={a.liveBadge}><i aria-hidden />Live</span><span className={a.viewers}>1.2k watching</span><span className={a.thumbBar} aria-hidden /></>
              : <span className={a.offBadge}><i aria-hidden />Off air</span>}
          </span>
          <span className={a.streamText}>
            <span className={a.streamEyebrow}>{liveNow ? 'Live now' : `Daily live draw · ${DRAW_HOUR}:00 CET`}</span>
            <b className={a.streamTitle}>{liveNow ? `Tim draws the day ${today} winner` : 'Tim draws live every day'}</b>
            <span className={a.streamDesc}>{liveNow ? `The winner is drawn live at ${DRAW_HOUR}:00 CET.` : 'Every draw is streamed on the TradeX channel.'}</span>
            {/* Nov 20, 2026: the countdown sits left of the button, which moves to the bottom-right corner. */}
            <span className={a.streamFoot}>
              <span className={a.streamCount} aria-label={`Draw in ${clock[0]} hours ${clock[1]} minutes`}>
                <span>Draw in</span><b>{pad(clock[0])}:{pad(clock[1])}:{pad(clock[2])}</b>
              </span>
              <a className={a.streamBtn} href="#" onClick={(e) => { e.preventDefault(); track('advent_stream_clicked', { day: today, live: liveNow }); }}>
                {liveNow
                  ? <><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M7 5v14l12-7z" fill="currentColor" /></svg>Watch live</>
                  : 'Open the channel'}
              </a>
            </span>
          </span>
        </section>
      </header>

      {carousel ? <AdventCarousel today={today} ticket={ticket} onJoin={join} /> : (
      <ol className={`${a.bento} ${equal ? a.equal : ''}`} aria-label="24 days of draws" onMouseLeave={() => { setTip(null); hovered.current = 0; }}>
        {DAYS.map((d) => {
          const state = stateOf(d);
          const big = !equal && d.area[2] * d.area[3] >= 3;
          return (
            <li key={d.day} tabIndex={0}
              aria-label={state === 'past' ? `Day ${d.day}, drawn: ${d.prize}, won by ${WINNERS[d.day] ?? 'a member'}` : `Day ${d.day}, ${d.day} December: ${KIND_LABEL[d.kind]}, ${d.prize}`}
              style={equal ? undefined : { gridArea: `${d.area[0]} / ${d.area[1]} / span ${d.area[2]} / span ${d.area[3]}` }}
              onMouseMove={(e) => move(e, d)}
              className={`${a.cell} ${a['state_' + state]} ${big ? a.big : ''}`}>
              <span className={a.num}>{d.day}</span>
              {state === 'past' && (
                <>
                  <span className={a.drawnTag}><svg viewBox="0 0 16 16" width="10" height="10" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Drawn</span>
                  {/* Nov 20, 2026: only the prize on the card; the winner is in the tooltip. */}
                  <span className={a.prize}><b>{d.prize}</b></span>
                </>
              )}
              {state === 'today' && (
                <>
                  <span className={a.todayTag}>Today</span>
                  <span className={a.todayRow}>
                    <span className={a.prize}><b>{d.prize}</b><span className={`${a.prizeMeta} ${a.todayMeta}`}>{KIND_LABEL[d.kind]} · drawn at {DRAW_HOUR}:00</span></span>
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
      )}

      {/* The Kraken requirement, under the calendar (Nov 20, 2026), so the top of the page stays light. */}
      <section className={`${a.banner} ${kraken ? a.bannerOn : ''}`} aria-label="Your participation">
        <span className={a.bannerIcon} aria-hidden>{kraken ? <TicketIcon /> : <Image src="/advent/kraken-glyph-white.svg" alt="" width={18} height={14} />}</span>
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
          : <button type="button" className={`${a.bannerBtn} ${a.bannerBtnKraken}`} onClick={() => { track('advent_connect_banner_clicked', { day: today }); setAsk(true); }}>Connect Kraken</button>}
      </section>

      {!carousel && <div className={a.legend} aria-hidden>
        <span><i className={a.legendDrawn} />Drawn</span>
        <span><i className={a.legendToday} />Today</span>
        <span><i className={a.legendNext} />Coming up · hover for the prize</span>
      </div>}

      {tip && (
        <div className={a.tip} role="tooltip" style={{ left: tip.x, top: tip.y }}>
          <span className={a.tipHead}>
            <span className={a.tipIcon} aria-hidden><KindIcon kind={tip.day.kind} /></span>
            <span>{tip.state === 'past' ? `Day ${tip.day.day} · drawn` : tip.state === 'today' ? `Today · ${tip.day.day} Dec` : `${tip.day.day} December`}</span>
          </span>
          <b className={a.tipPrize}>{tip.day.prize}</b>
          <span className={a.tipMeta}>
            {tip.state === 'past'
              ? `${KIND_LABEL[tip.day.kind]} · won by ${WINNERS[tip.day.day] ?? 'a member'}`
              : `${KIND_LABEL[tip.day.kind]} · drawn live at ${DRAW_HOUR}:00 CET`}
          </span>
        </div>
      )}

      {ask && (
        <div className={p.overlay} onClick={(e) => { if (e.target === e.currentTarget) setAsk(false); }}>
          <div className={`${p.card} ${a.krakenCard} ${a.hug}`} role="dialog" aria-modal="true" aria-labelledby="kraken-title">
            <div className={p.spot} aria-hidden />
            <div className={p.top}>
              <button type="button" className={p.close} onClick={() => setAsk(false)} aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
              <span className={p.label}>Advent Calendar · Day {today}</span>
              <span className={p.topSpacer} aria-hidden />
            </div>
            <div className={p.body}>
              <div className={p.pitch}>
                <div className={a.modalArt} aria-hidden><Image src="/advent/kraken-icon.svg" alt="" width={96} height={96} /></div>
                <div className={p.head}>
                  <h2 id="kraken-title" className={p.title}>Connect Kraken to take your ticket</h2>
                  <p className={p.lead}>The Advent Calendar is sponsored by Kraken.<br />Connect it to TradeX for a free ticket every day.</p>
                </div>
              </div>
              <div className={p.decide}>
                <div className={p.decideTop}>
                  <section className={p.section}>
                    <h3 className={p.sectionTitle}>Your benefits</h3>
                    <ul className={p.list}>
                      {['A ticket for every day until the 24th', 'Daily prizes, from crypto to merch', 'Winners announced live by Tim'].map((t, i) => (
                        <li key={t}><span className={p.tile}><Image src={`/signup/icons/${['trophy', 'money', 'forum'][i]}.svg`} alt="" width={20} height={20} /></span><span className={p.itemText}>{t}</span></li>
                      ))}
                    </ul>
                  </section>
                </div>
                <div className={p.actions}>
                  <button type="button" className={`${p.cta} ${p.ctaEx} ${a.exKraken}`} onClick={connect}>Connect Kraken</button>
                  <div className={p.after}><button type="button" className={p.secondary} onClick={() => setAsk(false)}>Not now</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
