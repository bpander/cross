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

export const invert = (obj: Dictionary<string | number>): Dictionary<string> => {
  const invertedObject: Dictionary<string> = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    invertedObject[value] = key;
  });

  return invertedObject;
};
