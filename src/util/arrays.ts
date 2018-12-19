
export const times = <T>(n: number, mapFn: (i: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(mapFn(i));
  }
  return result;
};
