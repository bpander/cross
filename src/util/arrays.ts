
export const includes = <T>(arr: T[], needle: T): boolean => {
  return arr.indexOf(needle) !== -1;
};

export const removeIndex = <T>(arr: T[], index: number): T[] => {
  if (index < 0) {
    return arr;
  }
  const clone = [ ...arr ];
  clone.splice(index, 1);
  return clone;
};

export const replaceIndex = <T>(arr: T[], index: number, replacement: T) => {
  if (index < 0) {
    return arr;
  }
  const clone = [ ...arr ];
  clone[index] = replacement;
  return clone;
};

export const removeFirst = <T>(arr: T[], needle: T): T[] => {
  return removeIndex(arr, arr.indexOf(needle));
};

export const times = <T>(n: number, mapFn: (i: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(mapFn(i));
  }
  return result;
};
