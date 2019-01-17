// import * as Types from './Types';
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
var ctx = self; // tslint:disable-line no-any
// export { ctx };
var initialConstraints;
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
var hasWord = function (closedSet, word) {
    for (var key in closedSet) {
        if (closedSet[key] === word) {
            return true;
        }
    }
    return false;
};
var fillWord = function (constraints, word) {
    var _a, _b;
    var slots = constraints.slots;
    var fittingWords = __assign({}, constraints.fittingWords, (_a = {}, _a[constraints.slot.id] = null, _a));
    var hasZero = constraints.slot.intersections.some(function (intersection) {
        var words = fittingWords[intersection.otherId];
        if (!words) {
            return false;
        }
        var char = word.substr(intersection.index, 1);
        var newWords = only(words, intersection.otherIndex, char);
        fittingWords[intersection.otherId] = newWords;
        return newWords.length === 0;
    });
    if (hasZero) {
        return { success: false };
    }
    var closedSet = __assign({}, constraints.closedSet, (_b = {}, _b[constraints.slot.id] = word, _b));
    var slot = getSlotWithLeastFittingWords(slots, fittingWords);
    if (!slot) {
        return { success: true, closedSet: closedSet };
    }
    var res = { success: false };
    fittingWords[slot.id].some(function (nextWord) {
        if (hasWord(closedSet, nextWord)) {
            return false;
        }
        res = fillWord({ slots: slots, fittingWords: fittingWords, closedSet: closedSet, slot: slot }, nextWord);
        return res.success;
    });
    return res;
};
var prepare = function (constraints) {
    initialConstraints = constraints;
};
var process = function (word) {
    var res = fillWord(initialConstraints, word);
    ctx.postMessage({ res: res, id: initialConstraints.slot.id, word: word });
};
ctx.addEventListener('message', function (e) {
    switch (e.data.type) {
        case 'prepare': return prepare(e.data.payload);
        case 'process': return process(e.data.payload);
    }
});
