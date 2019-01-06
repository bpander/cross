export interface Trie {
  size: number;
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
      size: 0,
      children : {},
    };
    curNode.children[curChar] = newNode;
    curNode.size++;
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

export const count = (trie: Trie, pattern: string[], i = 0): number => {
  const char = pattern[i];
  if (i === pattern.length - 1) {
    if (char === WILDCARD_SYMBOL) {
      return trie.size;
    }
    if (trie.children[char]) {
      return 1;
    }
    return 0;
  }
  let n = 0;
  if (char === WILDCARD_SYMBOL) {
    for (const key in trie.children) {
      n += count(trie.children[key], pattern, i + 1);
    }
    return n;
  }
  const subTrie = trie.children[char];
  if (!subTrie) {
    return 0;
  }
  return count(subTrie, pattern, i + 1);
};
