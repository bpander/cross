import * as Types from './Types';

const ctx: Worker = self as any; // tslint:disable-line no-any
export { ctx };

let initialConstraints: Types.Constraints;

const only = (words: string[], index: number, char: string): string[] => {
  return words.filter(word => word.slice(index, index + 1) === char);
};

const getSlotWithLeastFittingWords = (
  slots: Types.Slot[], fittingWords: Types.FittingWords,
): Types.Slot | undefined => {
  let slotWithLeastFittingWords: Types.Slot | undefined;
  let previousMin = Infinity;
  slots.forEach(slot => {
    const words = fittingWords[slot.id];
    if (!words) {
      return;
    }
    const count = words.length;
    if (count < previousMin) {
      slotWithLeastFittingWords = slot;
      previousMin = count;
    }
  });
  return slotWithLeastFittingWords;
};

const hasWord = (closedSet: Types.ClosedSet, word: string): boolean => {
  for (const key in closedSet) {
    if (closedSet[key] === word) {
      return true;
    }
  }
  return false;
};

const fillWord = (constraints: Types.Constraints, word: string): Types.FillResult => {
  if (hasWord(constraints.closedSet, word)) {
    return { success: false };
  }
  const slots = constraints.slots;
  const fittingWords: Types.FittingWords = {
    ...constraints.fittingWords,
    [constraints.slot.id]: null,
  };
  const hasZero = constraints.slot.intersections.some(intersection => {
    const words = fittingWords[intersection.otherId];
    if (!words) {
      return false;
    }
    const char = word.substr(intersection.index, 1);
    const newWords = only(words, intersection.otherIndex, char);
    fittingWords[intersection.otherId] = newWords;
    return newWords.length === 0;
  });
  if (hasZero) {
    return { success: false };
  }
  const closedSet = { ...constraints.closedSet, [constraints.slot.id]: word };
  const slot = getSlotWithLeastFittingWords(slots, fittingWords);
  if (!slot) {
    return { success: true, closedSet };
  }
  let res: Types.FillResult = { success: false };
  fittingWords[slot.id]!.some(nextWord => {
    res = fillWord({ slots, fittingWords, closedSet, slot }, nextWord);
    return res.success;
  });
  return res;
};

const prepare = (constraints: Types.Constraints) => {
  initialConstraints = constraints;
};

const process = (word: string) => {
  const res = fillWord(initialConstraints, word);
  ctx.postMessage({ res, id: initialConstraints.slot.id, word });
};

ctx.addEventListener('message', e => {
  switch (e.data.type) {
    case 'prepare': return prepare(e.data.payload);
    case 'process': return process(e.data.payload);
  }
});
