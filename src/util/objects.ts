import Dictionary from 'definitions/Dictionary';

interface ObjectMapper<T, R = T> {
  (value: T, key: string, obj: Dictionary<T>): R;
}

export const mapValues = <T, R = T>(obj: Dictionary<T>, mapper: ObjectMapper<T, R>): Dictionary<R> => {
  const mappedObject: Dictionary<R> = {};
  Object.keys(obj).forEach(key => {
    mappedObject[key] = mapper(obj[key], key, obj);
  });

  return mappedObject;
};

export const values = <T extends object>(obj: T): Array<T[keyof T]> => {
  return Object.keys(obj).map(key => obj[(key as keyof T)]);
};

export const minKey = <T>(obj: Dictionary<T>, evaluator: ObjectMapper<T, number>) => {
  let least = Infinity;
  let lowestKey: string | undefined;
  Object.keys(obj).forEach(key => {
    const curr = evaluator(obj[key], key, obj);
    if (curr < least) {
      lowestKey = key;
      least = curr;
    }
  });
  return lowestKey;
};
