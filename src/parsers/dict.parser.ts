interface ParseResult<T> {
  success: boolean;
  data: T;
}

export const parser = (contents: string): ParseResult<string[]> => {
  const lines = contents.split('\n');
  const parsableLines = lines.filter(line => !line.startsWith('#'));
  const words: string[] = parsableLines.map(line => {
    return line.replace(/[^a-zA-Z]/g, '').toUpperCase();
  });
  const data = words.filter(word => word.length >= 3 && word.length <= 15);
  return { success: true, data };
};
