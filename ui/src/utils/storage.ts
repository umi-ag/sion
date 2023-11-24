export const loadStorage = (key: string, storage = localStorage) => {
  const value = storage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return undefined;
};
