/** Small deterministic hash so demo ratings / stock stay stable between renders. */
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export const seeded = (str: string, min: number, max: number) => min + (hash(str) % (max - min + 1));
