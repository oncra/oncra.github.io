export const diff = (arr: number[]) => {
  return arr.slice(1).map(function(n, i) { return n - arr[i]; });
}

export const sum = (arr: number[]) => {
  return arr.reduce((x, y) => x + y);
}

export const mean = (arr: number[]) => {
  return sum(arr) / arr.length;
}

export const range = (arr: number[]) => {
  return Math.max(...arr) - Math.min(...arr);
}

export const makeArray = (a: number, b: number) => {
  return Array.from({length: b - a + 1}, (_, i) => a + i);
}