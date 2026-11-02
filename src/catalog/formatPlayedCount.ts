export function formatPlayedCount(count: number | null): string | null {
  if (count === null || !Number.isInteger(count) || count < 0) return null;
  if (count < 1000) return String(count);
  if (count < 10000) return `${Math.floor(count / 1000)}千`;
  if (count < 100000000) return `${Math.floor(count / 10000)}万`;
  return `${Math.floor(count / 100000000)}亿`;
}
