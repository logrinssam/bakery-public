/** 문제마다 고정되지만 서로 다른 순서가 되도록 시드 기반 셔플 */
export function shuffleOptions<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = (seed * 2654435761) >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
