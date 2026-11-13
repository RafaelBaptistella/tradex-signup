'use client';

import Image from 'next/image';
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import s from './signup.module.css';
import { track } from '@/lib/track';

/** Back · progress segments · "STEP n OF m" (Figma 645:22526). Step 0 is the welcome: no segment lit yet. */
export function StepHeader({ step, total, backHref, onBack }: { step: number; total: number; backHref?: string; onBack?: () => void }) {
  const inner = (
    <>
      <span className={s.backIcon}><Image src="/signup/arrow-left.svg" alt="" width={16} height={16} /></span>
      <span>Back</span>
    </>
  );
  if (total === 0) {
    return <div className={s.header}>{backHref ? <a className={s.back} href={backHref}>{inner}</a> : <button type="button" className={s.back} onClick={onBack}>{inner}</button>}</div>;
  }
  return (
    <div className={s.header}>
      {backHref ? <a className={s.back} href={backHref}>{inner}</a> : <button type="button" className={s.back} onClick={onBack}>{inner}</button>}
      <div className={s.progress} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step} aria-label={step ? `Step ${step} of ${total}` : `${total} short steps ahead`}>
        {Array.from({ length: total }, (_, i) => <div key={i} className={`${s.segment} ${i < step ? s.segmentDone : ''} ${i === step - 1 ? s.segmentOn : ''}`} />)}
      </div>
      <p className={s.stepCount} aria-hidden>{step ? `STEP ${step} OF ${total}` : `${total} SHORT STEPS`}</p>
    </div>
  );
}

/** Input (Figma component 498:3728). */
export function TextField({ id, label, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}</label>
      <input id={id} className={`${s.input} ${error ? s.inputError : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      {error && <p id={`${id}-error`} className={s.error} role="alert">{error}</p>}
    </div>
  );
}

/** Primary button (Figma component 429:3768). */
export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={s.button} />;
}

/** "Help" pill (Figma 1984:5964) with a small panel. */
export function HelpButton({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className={s.helpPanel} role="dialog" aria-label="Help" id="help-panel">
          {children}
        </div>
      )}
      <button
        type="button" className={s.help} aria-expanded={open} aria-controls="help-panel"
        onClick={() => { if (!open) track('signup_help_opened', { step_key: stepKey, help_type: 'help_button' }); setOpen(!open); }}
      >
        <Image src="/signup/help.svg" alt="" width={20} height={20} />
        Help
      </button>
    </>
  );
}

/** A box on an exchange print, as percentages of the image: left, top, width, height. */
export type Box = [number, number, number, number];
const boxStyle = ([l, t, w, h]: Box) => ({ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` });

/** Exchange print with a highlighted area (mark) and blurred personal data (masks); optional phone version. */
export function Shot({ desktop, mobile, alt, mark, mobileMark, masks = [], mobileMasks = [] }: { desktop: string; mobile?: string; alt: string; mark?: Box; mobileMark?: Box; masks?: Box[]; mobileMasks?: Box[] }) {
  return (
    <div className={s.previewImg}>
      <picture>
        {mobile && <source media="(max-width: 1023px)" srcSet={mobile} />}
        <img src={desktop} alt={alt} />
      </picture>
      {masks.map((m, i) => <span key={`d${i}`} className={`${s.shotMask} ${mobile ? s.shotMarkDesktop : ''}`} style={boxStyle(m)} aria-hidden />)}
      {mobile && mobileMasks.map((m, i) => <span key={`m${i}`} className={`${s.shotMask} ${s.shotMarkMobile}`} style={boxStyle(m)} aria-hidden />)}
      {mark && <span className={`${s.shotMark} ${mobile && mobileMark ? s.shotMarkDesktop : ''}`} style={boxStyle(mark)} aria-hidden />}
      {mobile && mobileMark && <span className={`${s.shotMark} ${s.shotMarkMobile}`} style={boxStyle(mobileMark)} aria-hidden />}
    </div>
  );
}

/** One sentence per line for subtitles, hints and notes: lines break between sentences, never mid-thought. */
export function Lines({ text }: { text: string }) {
  return <>{text.split(/(?<=[.!?])\s+(?=[A-Z“"])/).map((t, i) => <span key={i} className={s.line}>{t}</span>)}</>;
}

/** Highlighted note with a title and a subtitle (used for "your money stays on the exchange", "we save your progress"). */
export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={s.safety}>
      <Image src="/signup/check.svg" alt="" width={16} height={16} />
      <div>
        <p className={s.safetyTitle}>{title}</p>
        <p className={s.safetyText}>{typeof children === 'string' ? <Lines text={children} /> : children}</p>
      </div>
    </div>
  );
}

/** Right-hand visual (Figma 645:22562): gradient, stacked wordmark, noise. */
export function SignupVisual({ children }: { children?: ReactNode }) {
  return (
    <div className={s.aside}>
      <div className={s.visual} aria-hidden>
        <div className={s.wordmark}>
          {[0, 1, 2, 3, 4].map((i) => <span key={i}>TRADEX</span>)}
        </div>
        <div className={s.noise} />
        {/* 3D shape (Figma 645:22576, "CESINHA - Forma 3D 1"), exported as PNG on black; plus-lighter drops the black. */}
        <div className={s.shape}>
          <Image src="/signup/forma-3d.png" alt="" fill sizes="(max-width: 1023px) 0px, 27vw" className={s.shapeImg} priority />
        </div>
      </div>
      {children}
    </div>
  );
}

export { s as styles };
