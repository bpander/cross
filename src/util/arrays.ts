
export const includes = <T>(arr: T[], needle: T): boolean => {
  return arr.indexOf(needle) !== -1;
};

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

export const removeIndex = <T>(arr: T[], indexToRemove: number): T[] => {
  if (indexToRemove < 0) {
    return arr;
  }
  const clone = [ ...arr ];
  clone.splice(indexToRemove, 1);
  return clone;
};

export const removeFirst = <T>(arr: T[], predicate: (value: T) => boolean): T[] => {
  const indexToRemove = arr.findIndex(predicate);
  return removeIndex(arr, indexToRemove);
};
