export function normalizeEmail(input: string): string {
  const trimmed = input.trim();
  const at = trimmed.lastIndexOf('@');
  return at < 0 ? trimmed : `${trimmed.slice(0, at)}@${trimmed.slice(at + 1).toLowerCase()}`;
}

export function isEmail(input: string): boolean {
  const email = normalizeEmail(input);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function utf8Length(value: string): number {
  let bytes = 0;
  for (const character of value) {
    const point = character.codePointAt(0) ?? 0;
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function isPassword(input: string): boolean {
  return Array.from(input).length >= 8 && utf8Length(input) <= 128;
}

export function isEmailCode(input: string): boolean {
  return /^[0-9]{6,10}$/.test(input.trim());
}
