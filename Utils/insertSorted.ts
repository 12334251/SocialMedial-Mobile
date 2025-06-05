// src/utils/insertSorted.ts
export function insertSorted<T>(
  arr: T[],
  item: T,
  compare: (a: T, b: T) => number
): T[] {
  // Binary search for insertion index
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compare(arr[mid], item) < 0) lo = mid + 1;
    else hi = mid;
  }
  // Immutable splice
  return [...arr.slice(0, lo), item, ...arr.slice(lo)];
}
