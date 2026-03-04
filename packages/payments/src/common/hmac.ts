import { createHmac, timingSafeEqual } from 'crypto';

export function computeHmac(
  payload: string,
  secret: string,
  algorithm = 'sha256',
): string {
  return createHmac(algorithm, secret).update(payload).digest('hex');
}

export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm = 'sha256',
): boolean {
  const expected = computeHmac(payload, secret, algorithm);
  if (expected.length !== signature.length) return false;

  return timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex'),
  );
}
