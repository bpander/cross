export interface Trie {
  size: number;
  children: { [char: string]: Trie };
}

export const add = (trie: Trie, str: string, i = 0) => {
  if (i === str.length) {
    return emptyTrie;
  }
  const char = str.slice(i, i + 1);
  const subTrie = trie.children[char] || { size: 0, children: {} };

  const newTrie: Trie = {
    size: trie.size + 1,
    children: {
      ...trie.children,
      [char]: add(subTrie, str, i + 1),
    },
  };
  return newTrie;
};

interface Predicate {
  (chars: string): boolean;
}

const objSome = <T>(obj: { [key: string]: T }, predicate: Predicate): boolean => {
  for (let key in obj) {
    if (predicate(key)) {
      return true;
    }
  }
  return false;
};

export const some = (trie: Trie, depth: number, predicate: Predicate, i = 0, prefix = ''): boolean => {
  if (i === depth) {
    return objSome(trie.children, char => predicate(prefix + char));
  }

  for (const key in trie.children) {
    if (some(trie.children[key], depth, predicate, i + 1, prefix + key)) {
      return true;
    }
  }

  return false;
};

const emptyTrie = { children: {}, size: 0 };

export const only = (trie: Trie, depth: number, char: string, i = 0): Trie => {
  if (i === depth) {
    const subTrie: Trie = trie.children[char];
    if (subTrie) {
      const clone: Trie = {
        children: { [char]: subTrie },
        size: subTrie.size || 1,
      };
      return clone;
    }
    return emptyTrie;
  }

  const clone = { children: { ...trie.children }, size: trie.size };
  for (const key in trie.children) {
    const oldSubTrie = trie.children[key];
    const newSubTrie = only(oldSubTrie, depth, char, i + 1);
    if (newSubTrie.size > 0) {
      clone.size = clone.size - (oldSubTrie.size - newSubTrie.size);
      clone.children[key] = newSubTrie;
    } else {
      delete clone.children[key];
      clone.size = clone.size - oldSubTrie.size;
    }
  }
  return clone;
};
