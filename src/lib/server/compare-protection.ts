import { isIP } from 'node:net';
import { checkRateLimit } from '@vercel/firewall';
import { ProofPathError } from '../shared/errors';

// Configure the rule's @vercel/firewall "Rate limit ID" to this exact value.
// A display name or WAF resource ID does not create that SDK condition itself.
export const COMPARISON_RATE_LIMIT_ID = 'rule_proofpath_compare_B67HTY';

// Counters live in Vercel's regional firewall, never in this function instance.
// A missing rule or failed check must not silently enable public inference.
export async function enforceComparisonRateLimit(
  request: Request,
  checker: typeof checkRateLimit = checkRateLimit,
) {
  if (process.env.ANALYSIS_ENABLED !== 'true') return;
  if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') return;
  const unavailable = () => new ProofPathError('COMPARISON_PROTECTION_UNAVAILABLE',
    'Live comparison is temporarily unavailable because request protection could not be verified. No AI request was made.', 503);
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '';
  const ip = request.headers.get('x-real-ip') ?? '';
  // Production host comes from platform configuration, not a caller's Host.
  // Forward only the platform client IP; never cookies or authorization headers.
  if (process.env.VERCEL !== '1' || process.env.NODE_ENV !== 'production'
    || !/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z\d-]+$/i.test(host) || !isIP(ip)) throw unavailable();
  const firewallRequest = new Request(`https://${host}/api/compare`, {
    headers: { host, 'x-real-ip': ip, 'x-forwarded-for': ip },
  });
  let decision;
  try {
    decision = await checker(COMPARISON_RATE_LIMIT_ID, { request: firewallRequest, timeout: 2_000 });
  } catch { throw unavailable(); }
  if (decision.error || typeof decision.rateLimited !== 'boolean') throw unavailable();
  if (decision.rateLimited) throw new ProofPathError('COMPARISON_RATE_LIMITED',
    'Too many comparison requests. Wait a minute before trying again. No AI request was made.', 429);
}
