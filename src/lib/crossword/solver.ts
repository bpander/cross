import Dictionary from 'definitions/Dictionary';

import * as Types from './Types';

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

interface AutoFill {
  (grid: string[], slots: Types.Slot[], fittingWords: Types.FittingWords, usedWords: string[]): Types.AutoFillResult;
}

export const autoFill: AutoFill = (grid, slots, fittingWords, usedWords) => {
  let res: Types.AutoFillResult = { success: false };
  const slot = getSlotWithLeastFittingWords(slots, fittingWords);
  if (!slot) {
    return { success: true, grid };
  }
  fittingWords[slot.id]!.some(candidate => {
    if (usedWords.indexOf(candidate) > -1) {
      return false;
    }
    const newGrid = fillWordAt(grid, candidate, slot);
    const newFittingWords: Dictionary<string[] | null> = {
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
    if (!hasZero) {
      res = autoFill(newGrid, slots, newFittingWords, [ ...usedWords, candidate ]);
    }
    return res.success;
  });

  return res;
};
