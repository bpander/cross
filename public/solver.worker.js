var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};
var ctx = self;
var fillWordAt = function (grid, word, slot) {
  var gridCopy = grid.slice();
  slot.cells.forEach(function (cell, i) {
      gridCopy[cell] = word.slice(i, i + 1);
  });
  return gridCopy;
};
var only = function (words, index, char) {
  return words.filter(function (word) { return word.slice(index, index + 1) === char; });
};
var getSlotWithLeastFittingWords = function (slots, fittingWords) {
  var slotWithLeastFittingWords;
  var previousMin = Infinity;
  slots.forEach(function (slot) {
      var words = fittingWords[slot.id];
      if (!words) {
          return;
      }
      var count = words.length;
      if (count < previousMin) {
          slotWithLeastFittingWords = slot;
          previousMin = count;
      }
  });
  return slotWithLeastFittingWords;
};
var fillWord = function (grid, slots, fittingWords, usedWords, word, slot) {
  var _a;
  var newGrid = fillWordAt(grid, word, slot);
  var newFittingWords = __assign({}, fittingWords, (_a = {}, _a[slot.id] = null, _a));
  var hasZero = slot.intersections.some(function (intersection) {
      var words = newFittingWords[intersection.otherId];
      if (!words) {
          return false;
      }
      var char = newGrid[intersection.cell];
      var newWords = only(words, intersection.otherIndex, char);
      newFittingWords[intersection.otherId] = newWords;
      return newWords.length === 0;
  });
  if (hasZero) {
      return { success: false };
  }
  var nextSlot = getSlotWithLeastFittingWords(slots, newFittingWords);
  if (!nextSlot) {
      return { success: true, grid: newGrid };
  }
  var newUsedWords = usedWords.concat([word]);
  var res = { success: false };
  newFittingWords[nextSlot.id].some(function (nextWord) {
      if (newUsedWords.indexOf(nextWord) > -1) {
          return false;
      }
      res = fillWord(newGrid, slots, newFittingWords, newUsedWords, nextWord, nextSlot);
      return res.success;
  });
  return res;
};
ctx.addEventListener('message', function (e) {
  var _a = e.data, grid = _a.grid, slots = _a.slots, fittingWords = _a.fittingWords, usedWords = _a.usedWords, word = _a.word, slot = _a.slot;
  var res = fillWord(grid, slots, fittingWords, usedWords, word, slot);
  ctx.postMessage({ res: res, id: slot.id, word: word });
});
