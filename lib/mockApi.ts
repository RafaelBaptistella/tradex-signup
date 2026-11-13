/**
 * Stand-ins for the TradeX signup endpoints, so the screens can be clicked through.
 * Replace each function with the real API call and keep the result values,
 * because the tracking reports them.
 */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CodeResult = 'ok' | 'wrong' | 'expired';
export type RegisterResult = 'ok' | 'email_taken';
export type UidResult = 'ok' | 'already_used';
export type AttributionResult = 'ok' | 'not_linked';

/** Demo rule: 222222222 was not opened through TradeX (goes to A-19); any other UID is confirmed after a short wait. */
export async function checkAttribution(uid: string): Promise<AttributionResult> {
  await wait(3200);
  return uid === '222222222' ? 'not_linked' : 'ok';
}

/** Demo rule: 111111111 is already connected to another TradeX account; any other valid UID is accepted for checking. */
export async function submitUid(uid: string): Promise<UidResult> {
  await wait(800);
  return uid === '111111111' ? 'already_used' : 'ok';
}

/** Demo rule: taken@example.com already has an account. */
export async function register(email: string, _password: string): Promise<RegisterResult> {
  await wait(500);
  return email.trim().toLowerCase() === 'taken@example.com' ? 'email_taken' : 'ok';
}

export async function sendCode(_email: string): Promise<void> {
  await wait(200);
}

/** Demo rule: 000000 is wrong, 999999 has expired, any other 6 digits pass. */
export async function verifyCode(code: string): Promise<CodeResult> {
  await wait(600);
  if (code === '000000') return 'wrong';
  if (code === '999999') return 'expired';
  return 'ok';
}
