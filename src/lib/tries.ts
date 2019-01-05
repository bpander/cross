export interface Trie {
  children: { [char: string]: Trie };
}

export const add = (trie: Trie, key: string) => {
  let curNode = trie;
  let curChar = key.slice(0,1);

  key = key.slice(1);

  while (curNode.children[curChar] !== undefined && curChar.length > 0) {
    curNode = curNode.children[curChar];
    curChar = key.slice(0,1);
    key = key.slice(1);
  }

  while (curChar.length > 0) {
    let newNode: Trie = {
      children : {},
    };
    curNode.children[curChar] = newNode;
    curNode = newNode;
    curChar = key.slice(0,1);
    key = key.slice(1);
  }
};

interface Predicate {
  (chars: string): boolean;
}
const WILDCARD_SYMBOL = '';

export const some = (trie: Trie, pattern: string[], predicate: Predicate, i = 0, prefix = ''): boolean => {
  const patternChar = pattern[i];
  if (i === pattern.length - 1) {
    if (patternChar === WILDCARD_SYMBOL) {
      return Object.keys(trie.children).some(char => predicate(prefix + char));
    }
    const char = trie.children[patternChar];
    if (char) {
      return predicate(prefix + patternChar);
    }
    return false;
  }

  if (patternChar === WILDCARD_SYMBOL) {
    for (const key in trie.children) {
      if (some(trie.children[key], pattern, predicate, i + 1, prefix + key)) {
        return true;
      }
    }
  }

  const subTrie = trie.children[patternChar];
  if (!subTrie) {
    return false;
  }
  return some(subTrie, pattern, predicate, i + 1, prefix + patternChar);
};
