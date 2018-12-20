
export const replaceIndex = <T>(arr: T[], index: number, replacement: T) => {
  if (index < 0) {
    return arr;
  }
  const clone = [ ...arr ];
  clone.splice(index, 1, replacement);
  return clone;
};

export const times = <T>(n: number, mapFn: (i: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(mapFn(i));
  }
  return result;
};
