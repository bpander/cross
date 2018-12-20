
type Vector2 = [ number, number ];

export const getXY = (stride: number, index: number): Vector2 => {
  const x = index % stride;
  const y = Math.floor(index / stride);
  return [ x, y ];
};

export const getIndex = (stride: number, p: Vector2): number => {
  const [ x, y ] = p;
  return y * stride + x;
};

export const reflectXY = (p1: Vector2, p2: Vector2): Vector2 => {
  return [
    p2[0] + (p2[0] - p1[0]),
    p2[1] + (p2[1] - p1[1]),
  ];
};
