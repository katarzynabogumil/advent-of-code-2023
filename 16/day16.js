const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

const RIGHT = 'right';
const LEFT = 'left';
const UP = 'up';
const DOWN = 'down';

const MATRIX = data.split('\n').map((line) => line.split(''));

function first(current, direction) {
  let VISITED = {};
  VISITED[UP] = new Set();
  VISITED[DOWN] = new Set();
  VISITED[LEFT] = new Set();
  VISITED[RIGHT] = new Set();

  function go([x, y], direction) {
    if (VISITED[direction].has(str([x, y]))) return;
    if (x < 0 || y < 0 || x > MATRIX[0].length - 1 || y > MATRIX.length - 1)
      return;

    let vector;
    if (direction === RIGHT) vector = [1, 0];
    if (direction === LEFT) vector = [-1, 0];
    if (direction === UP) vector = [0, -1];
    if (direction === DOWN) vector = [0, 1];
    const [vX, vY] = vector;

    VISITED[direction].add(str([x, y]));
    const value = MATRIX[y][x];
    switch (value) {
      case '.':
        return go([x + vX, y + vY], direction);
      case '-':
        if (direction === RIGHT || direction === LEFT)
          return go([x + vX, y + vY], direction);
        return [go([x + 1, y], RIGHT), go([x - 1, y], LEFT)];
      case '|':
        if (direction === UP || direction === DOWN)
          return go([x + vX, y + vY], direction);
        return [go([x, y + 1], DOWN), go([x, y - 1], UP)];
      case '/':
        if (direction === RIGHT) return go([x, y - 1], UP);
        if (direction === LEFT) return go([x, y + 1], DOWN);
        if (direction === UP) return go([x + 1, y], RIGHT);
        if (direction === DOWN) return go([x - 1, y], LEFT);
      case '\\':
        if (direction === LEFT) return go([x, y - 1], UP);
        if (direction === RIGHT) return go([x, y + 1], DOWN);
        if (direction === DOWN) return go([x + 1, y], RIGHT);
        if (direction === UP) return go([x - 1, y], LEFT);
    }
  }

  go(current, direction);

  return new Set([
    ...VISITED[UP],
    ...VISITED[DOWN],
    ...VISITED[LEFT],
    ...VISITED[RIGHT],
  ]).size;
}

function str(point) {
  return point.join(',');
}

function second() {
  let MAX = 0;
  MATRIX.forEach((line, y) => {
    line.forEach((_, x) => {
      let energized;
      if (x === 0) energized = first([x, y], RIGHT);
      if (energized > MAX) MAX = energized;

      if (y === 0) energized = first([x, y], DOWN);
      if (energized > MAX) MAX = energized;

      if (x === line.length - 1) energized = first([x, y], RIGHT);
      if (energized > MAX) MAX = energized;

      if (y === MATRIX.length - 1) energized = first([x, y], RIGHT);
      if (energized > MAX) MAX = energized;
    });
  });
  return MAX;
}

console.log(first([0, 0], RIGHT));
// const start = performance.now();
console.log(second());
// const end = performance.now();
// console.log(`Execution time: ${end - start} ms`);
