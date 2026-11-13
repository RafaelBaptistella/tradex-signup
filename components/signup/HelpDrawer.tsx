'use client';

/**
 * Flow A · A-20 · Help drawer (every connect step, A-09 to A-14).
 * Canvas requirements: FAQ for the current step; video for the current step; live help on the Discord
 * support channel; "I'm stuck" button that logs where. Events: connect_help_opened {step},
 * connect_stuck_reported {step}.
 * Opens from the same Help pill as the other screens (Figma 1984:5964); the panel uses the glass modal style (964:5925).
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { styles as s } from './parts';
import { HELP, DISCORD_SUPPORT, fill, type HelpStep } from '@/lib/help';
import { track } from '@/lib/track';

export default function HelpDrawer({ step, exchange, exchangeId }: { step: HelpStep; exchange: string; exchangeId: string }) {
  const [open, setOpen] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);
  const [video, setVideo] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const h = HELP[step];
  const P = { step: h.number, step_name: step, exchange: exchangeId };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const show = () => { track('connect_help_opened', P); setOpen(true); };
  const ask = (i: number) => {
    if (faq !== i) track('connect_help_faq_opened', { ...P, question: h.faq[i].q });
    setFaq(faq === i ? null : i);
  };
  const reportStuck = () => { track('connect_stuck_reported', P); setStuck(true); };
  const talk = () => { track('connect_help_support_clicked', P); window.open(DISCORD_SUPPORT, '_blank', 'noopener'); };

  return (
    <>
      <button type="button" className={s.help} onClick={show} aria-haspopup="dialog" aria-expanded={open}>
        <Image src="/signup/help.svg" alt="" width={20} height={20} />
        Help
      </button>

      {open && (
        <div className={s.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <aside className={s.drawer} role="dialog" aria-modal="true" aria-labelledby="help-title">
            <div className={s.modalNoise} />
            <div className={s.drawerTop}>
              <div>
                <p className={s.drawerKicker}>{h.number ? `Step ${h.number} of 5` : 'Before you start'}</p>
                <h2 id="help-title" className={s.drawerTitle}>Help · {fill(h.name, exchange)}</h2>
              </div>
              <button ref={closeRef} type="button" className={s.drawerClose} onClick={() => setOpen(false)} aria-label="Close help">×</button>
            </div>

            <div className={s.drawerBody}>
              <button type="button" className={s.video} onClick={() => { track('explainer_video_played', { ...P, screen: step }); setVideo(true); }}>
                <span className={s.videoPlay} aria-hidden>▶</span>
                <span className={s.videoText}><b>{fill(h.video, exchange)}</b><span>Short video for this step</span></span>
              </button>
              {video && <p className={s.hint} role="status">The video plays here once it is recorded.</p>}

              <section className={s.planBlock} aria-labelledby="help-faq">
                <h3 id="help-faq" className={s.questionLabel}>Questions about this step</h3>
                <div className={s.faq}>
                  {h.faq.map((f, i) => (
                    <div key={f.q} className={s.faqItem}>
                      <button type="button" className={s.faqQ} aria-expanded={faq === i} aria-controls={`help-${i}`} onClick={() => ask(i)}>
                        {fill(f.q, exchange)}<span aria-hidden className={s.faqIcon}>{faq === i ? '−' : '+'}</span>
                      </button>
                      {faq === i && <p id={`help-${i}`} className={s.faqA}>{fill(f.a, exchange)}</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section className={s.planBlock} aria-labelledby="help-person">
                <h3 id="help-person" className={s.questionLabel}>Still stuck?</h3>
                <div className={s.optionList}>
                  <button type="button" className={s.option} onClick={talk}>
                    <b>Talk to a person on Discord</b>
                    <span>Our support channel answers questions about connecting.</span>
                  </button>
                  {stuck ? (
                    <p className={`${s.hint} ${s.hintOk}`} role="status">Thanks. We noted you’re stuck on this step, so we can make it easier.</p>
                  ) : (
                    <button type="button" className={s.option} onClick={reportStuck}>
                      <b>I’m stuck here</b>
                      <span>One tap tells us which step to improve.</span>
                    </button>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
