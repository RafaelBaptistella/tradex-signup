'use client';

/**
 * Paywall-style dialog shared by every "connect an exchange" moment in flows B and C:
 * B-03 connect modal, B-07 / C-05 locked feature sheets, C-04 daily trial modals (day 1 = C-03 welcome),
 * C-09 lock wall and C-11 reactivation landing.
 * Built after the mobile-paywall reference: spotlight + 3D art on top, title, a feature card with icon tiles,
 * two selectable option cards (here the exchanges and their monthly prize pools) and one strong CTA.
 * variant 'modal' sits over the platform; variant 'page' is the same card on its own page (C-11).
 */
import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EXCHANGES, readProfile, recommend, type ExchangeId } from '@/lib/exchanges';
import { Lines } from '@/components/signup/parts';
import p from './paywall.module.css';

export type PaywallItem = { icon: string; text: string; state?: 'open' | 'locked' | 'todo' };
export type PaywallSection = { title?: string; items: PaywallItem[] };

type Props = {
  id: string;
  /** Small label top-centre, e.g. "You’re in TradeX" or a locked feature name. */
  label?: string;
  labelLocked?: boolean;
  /** Corner chip, e.g. "4 days left". 'warn' turns it and the spotlight amber. */
  chip?: string;
  tone?: 'accent' | 'warn';
  art?: 'gem' | 'forma';
  title: string;
  lead?: string;
  sections?: PaywallSection[];
  /** Show the two exchanges as selectable cards; the primary button then connects the selected one. */
  exchanges?: boolean;
  primary: { label: string | ((name: string) => string); onClick: (exchange: ExchangeId) => void };
  secondary?: { label: string; onClick: () => void };
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  variant?: 'modal' | 'page';
};

/** Monthly prize pool cards: the "Monthly / Yearly" plan cards of a paywall, as Bitunix / Pionex. */
const OPTION_NOTE: Record<ExchangeId, string> = { bitunix: 'Most members', pionex: 'Free trading bots' };

export default function Paywall(props: Props) {
  const { id, label, labelLocked, chip, tone = 'accent', art = 'gem', title, lead, sections = [], exchanges, primary, secondary, onClose, children, footer, wide, variant = 'modal' } = props;
  const [selected, setSelected] = useState<ExchangeId>('bitunix');
  const [pick, setPick] = useState<ExchangeId>('bitunix');
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const r = recommend(readProfile()).id;
    setPick(r); setSelected(r);
    if (variant !== 'modal') return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [variant]);

  const ex = EXCHANGES.find((x) => x.id === selected)!;
  const primaryLabel = typeof primary.label === 'function' ? primary.label(ex.name) : primary.label;

  const card = (
    <div ref={ref} tabIndex={-1} className={`${p.card} ${wide ? p.wide : ''} ${tone === 'warn' ? p.warn : ''}`}
      role={variant === 'modal' ? 'dialog' : undefined} aria-modal={variant === 'modal' ? true : undefined} aria-labelledby={`${id}-title`}>
      <div className={p.spot} aria-hidden />
      <div className={p.curtain} aria-hidden />

      <div className={p.top}>
        {onClose
          ? <button type="button" className={p.close} onClick={onClose} aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
          : <span className={p.topSpacer} aria-hidden />}
        {label && <span className={p.label}>{labelLocked && <Image src="/dashboard/icons/lock.svg" alt="" width={12} height={12} />}{label}</span>}
        {chip ? <span className={p.chip}><Image src="/signup/icons/timer.svg" alt="" width={14} height={14} />{chip}</span> : <span className={p.topSpacer} aria-hidden />}
      </div>

      <div className={p.art} aria-hidden>
        <span className={`${p.spark} ${p.sparkA}`} />
        <span className={`${p.spark} ${p.sparkB}`} />
        {art === 'gem'
          ? <Image className={p.gem} src="/signup/rank/gem-rekrut.png" alt="" width={132} height={132} priority />
          : <Image className={p.forma} src="/signup/forma-3d.png" alt="" width={110} height={212} priority />}
      </div>

      <div className={p.head}>
        <h2 id={`${id}-title`} className={p.title}>{title}</h2>
        {lead && <p className={p.lead}><Lines text={lead} /></p>}
      </div>

      {sections.length > 0 && (
        <div className={`${p.sections} ${sections.length > 1 ? p.sectionsTwo : ''}`}>
          {sections.map((s, i) => (
            <section key={i} className={p.section} aria-label={s.title}>
              {s.title && <h3 className={p.sectionTitle}>{s.title}</h3>}
              <ul className={p.list}>
                {s.items.map((it) => (
                  <li key={it.text} className={it.state === 'locked' || it.state === 'todo' ? p.itemMuted : ''}>
                    <span className={p.tile}>
                      <Image src={it.state === 'locked' ? '/dashboard/icons/lock.svg' : `/signup/icons/${it.icon}.svg`} alt="" width={16} height={16} />
                    </span>
                    <span className={p.itemText}>{it.text}</span>
                    {it.state === 'open' && <Image className={p.itemCheck} src="/signup/check.svg" alt="Open" width={14} height={14} />}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {exchanges && (
        <div className={p.options} role="radiogroup" aria-label="Exchange">
          {EXCHANGES.map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={selected === x.id}
              className={`${p.option} ${x.id === 'pionex' ? p.exPionex : p.exBitunix} ${selected === x.id ? p.optionOn : ''}`} onClick={() => setSelected(x.id)}>
              {x.id === pick && <span className={p.optionBadge}>{OPTION_NOTE[x.id]}</span>}
              <span className={p.optionHead}><Image src={x.logo.src} alt="" width={20} height={20} className={p.optionLogo} />{x.name}</span>
              <b className={p.optionPool}>{x.pool}</b>
              <span className={p.optionNote}>Monthly prize pool</span>
            </button>
          ))}
        </div>
      )}

      {children}

      <div className={p.actions}>
        <button type="button" className={`${p.cta} ${exchanges ? (selected === 'pionex' ? p.exPionex : p.exBitunix) : ''} ${exchanges ? p.ctaEx : ''}`} onClick={() => primary.onClick(selected)}>{primaryLabel}</button>
        {secondary && <button type="button" className={p.secondary} onClick={secondary.onClick}>{secondary.label}</button>}
      </div>
      {footer && <div className={p.footer}>{footer}</div>}
    </div>
  );

  if (variant === 'page') return card;
  return (
    <div className={p.overlay} onClick={(e) => { if (onClose && e.target === e.currentTarget) onClose(); }}>
      {card}
    </div>
  );
}
