export const diff = (arr: number[]) => {
  return arr.slice(1).map(function(n, i) { return n - arr[i]; });
}

export const sum = (arr: number[]) => {
  return arr.reduce((x, y) => x + y);
}

export const mean = (arr: number[]) => {
  return sum(arr) / arr.length;
}