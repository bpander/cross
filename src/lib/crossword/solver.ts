import groupBy from 'lodash/groupBy';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import { Answer, Intersection } from 'lib/crossword';
import { mapValues, values } from 'util/objects';
import Dictionary from 'definitions/Dictionary';
import includes from 'lodash/includes';

type AutoFillResult = { success: false; } | { success: true; solution: Dictionary<string>; };

const len = <T>(arr?: T[]): number => {
  if (arr) {
    return arr.length;
  }
  return 0;
}

export const autoFill = (answerMap: Dictionary<Answer>, wordBank: string[]): AutoFillResult => {
  const wordByLength = groupBy(wordBank, 'length');
  const fittingWords = mapValues(answerMap, answer => [ ...wordByLength[answer.cells.length] ]);

  return findSolution(answerMap, fittingWords);
};

const findSolution = (answerMap: Dictionary<Answer>, fittingWords: Dictionary<string[]>): AutoFillResult => {
  let result: AutoFillResult = { success: false };
  const initialId = getOptimalGuessLine(Object.keys(answerMap), fittingWords);
  if (!initialId) {
    return { success: false };
  }
  const currentSolution = {};
  fittingWords[initialId].some(possible_word => {
    result = guess_word(answerMap, initialId, possible_word, fittingWords, currentSolution);
    return result.success;
  });

  return result;
};

const wordsFit = (intersection: Intersection, firstWord: string, secondWord: string): boolean => {
  return firstWord[intersection.firstIntersect] == secondWord[intersection.secondIntersect];
};

const guess_word = (answerMap: Dictionary<Answer>, line_id: string, guess: string, fittingWords: Dictionary<string[]>, currentSolution: Dictionary<string>): AutoFillResult => {
  currentSolution[line_id] = guess;
  const guessedAnswer = answerMap[line_id];
  // # We copy new_fitting_words so that we can remove words from it without
  // # modifying the fitting_words list in other solution branches.
  const new_fitting_words = cloneDeep(fittingWords);

  for (let i = 0; i < guessedAnswer.intersections.length; i++) {
    const intersect = guessedAnswer.intersections[i];
    if (currentSolution[intersect.secondId]) {
      continue;
    }
    new_fitting_words[intersect.secondId] = new_fitting_words[intersect.secondId].filter(word => {
      return wordsFit(intersect, guess, word);
    });

    if (!new_fitting_words[intersect.secondId].length) {
      delete currentSolution[line_id];
      return { success: false };
    }
  }

  const solved_ids = Object.keys(currentSolution);
  const all_ids = Object.keys(answerMap);
  const possible_ids = difference(all_ids, solved_ids);
  if (!possible_ids.length) {
    return { success: true, solution: currentSolution };
  }
  const target_id = getOptimalGuessLine(possible_ids, new_fitting_words);
  if (!target_id) {
    return { success: false };
  }

  let result: AutoFillResult = { success: false };
  new_fitting_words[target_id].some(possibleWord => {
    if (includes(values(currentSolution), possibleWord)) {
      return false;
    }
    result = guess_word(answerMap, target_id, possibleWord, new_fitting_words, currentSolution);
    return result.success;
  });

  if (!result.success) {
    delete currentSolution[line_id];
  }
  return result;
};

const getOptimalGuessLine = (id_list: string[], fittingWords: Dictionary<string[]>): string | undefined => {
  if (!id_list.length) {
    return;
  }
  
  let target_id = id_list[0];
  let lowest_possibility_count = len(fittingWords[target_id]);
  id_list.forEach(line_id => {
    const num_fitting_words = len(fittingWords[line_id]);
    if (num_fitting_words < lowest_possibility_count) {
      lowest_possibility_count = num_fitting_words;
      target_id = line_id;
    }
  });

  return target_id;
};
