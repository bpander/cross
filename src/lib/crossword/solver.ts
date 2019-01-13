import * as Types from './Types';
export { ctx };

const ctx: Worker = self as any;

const fillWordAt = (grid: string[], word: string, slot: Types.Slot): string[] => {
  const gridCopy = [ ...grid ];
  slot.cells.forEach((cell, i) => {
    gridCopy[cell] = word.slice(i, i + 1);
  });
  return gridCopy;
};

const only = (words: string[], index: number, char: string): string[] => {
  return words.filter(word => word.slice(index, index + 1) === char);
};

const getSlotWithLeastFittingWords = (slots: Types.Slot[], fittingWords: Types.FittingWords): Types.Slot | undefined => {
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

const fillWord = (grid: string[], slots: Types.Slot[], fittingWords: Types.FittingWords, usedWords: string[], word: string, slot: Types.Slot): Types.AutoFillResult => {
  const newGrid = fillWordAt(grid, word, slot);
  const newFittingWords: Types.FittingWords = {
    ...fittingWords,
    [slot.id]: null,
  };
  const hasZero = slot.intersections.some(intersection => {
    const words = newFittingWords[intersection.otherId];
    if (!words) {
      return false;
    }
    const char = newGrid[intersection.cell];
    const newWords = only(words, intersection.otherIndex, char);
    newFittingWords[intersection.otherId] = newWords;
    return newWords.length === 0;
  });
  if (hasZero) {
    return { success: false };
  }
  const nextSlot = getSlotWithLeastFittingWords(slots, newFittingWords);
  if (!nextSlot) {
    return { success: true, grid: newGrid };
  }
  const newUsedWords = [ ...usedWords, word ];
  let res: Types.AutoFillResult = { success: false };
  newFittingWords[nextSlot.id]!.some(nextWord => {
    if (newUsedWords.indexOf(nextWord) > -1) {
      return false;
    }
    res = fillWord(newGrid, slots, newFittingWords, newUsedWords, nextWord, nextSlot);
    return res.success;
  });
  return res;
};


ctx.addEventListener('message', e => {
  const { grid, slots, fittingWords, usedWords, word, slot } = e.data;
  const res = fillWord(grid, slots, fittingWords, usedWords, word, slot);
  ctx.postMessage({ res, id: slot.id, word });
});
