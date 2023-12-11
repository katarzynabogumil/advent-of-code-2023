'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const input = parseInput(data);
  const path = findPath(input);
  return path.length / 2;
}

/* 
Rewrtitten for part two, in part one counted 
only the steps without keeping track of the path.
 */

function findPath(input) {
  const [matrix, start] = mapPipes(input);
  let [currX, currY] = findFirstStep(input, start);
  let [prevX, prevY] = start;
  let path = [[prevX, prevY]];

  while (matrix[currY][currX] !== 'S') {
    path.push([currX, currY]);
    let [x, y] = matrix[currY][currX]; // vector
    let [aX, aY] = [prevX - x, prevY - y];
    let [bX, bY] = [prevX + x, prevY + y];
    let next = [];

    if (Math.abs(aX - currX) <= 1 && Math.abs(aY - currY) <= 1) next = [aX, aY];
    else next = [bX, bY];

    [prevX, prevY] = [currX, currY];
    [currX, currY] = next;
  }
  return path;
}

function parseInput(data) {
  return data
    .trim()
    .split('\n')
    .map((line) => line.trim().split(''));
}

function mapPipes(data) {
  const pipes = {
    '|': [0, 2],
    '-': [2, 0],
    L: [1, 1],
    J: [1, -1],
    7: [1, 1],
    F: [1, -1],
  };

  const pipeSet = new Set(Object.keys(pipes));
  let start = [0, 0];

  return [
    data.map((line, y) =>
      line.map((pipe, x) => {
        if (pipeSet.has(pipe)) return pipes[pipe];
        if (pipe === 'S') {
          start = [x, y];
          return 'S';
        }
        return 0;
      })
    ),
    start,
  ];
}

function findFirstStep(matrix, [i, j]) {
  const pipes = {
    '|': [
      [0, 1],
      [0, -1],
    ],
    '-': [
      [1, 0],
      [1, 0],
    ],
    L: [
      [-1, 0],
      [0, 1],
    ],
    J: [
      [1, 0],
      [0, 1],
    ],
    7: [
      [1, 0],
      [0, -1],
    ],
    F: [
      [-1, 0],
      [0, -1],
    ],
  };

  let found = [];
  for (
    let y = Math.max(0, j - 1);
    y <= Math.min(j + 1, matrix.length - 1);
    y++
  ) {
    for (
      let x = Math.max(0, i - 1);
      x <= Math.min(i + 1, matrix[0].length - 1);
      x++
    ) {
      const value = matrix[y][x];
      Object.entries(pipes).forEach(([pipe, arr]) => {
        if (value !== pipe) return;
        arr.forEach(([vX, vY]) => {
          if (x === i + vX && y === j + vY) found = [x, y];
        });
      });
      if (found.length) return found;
    }
  }
}

function second(data) {
  const input = parseInput(data);
  const path = findPath(input); // changed part one

  // get rid of all pipes not in path
  const pathSet = new Set(path.map((el) => el.join(',')));
  const matrix = input.map((line, y) =>
    line.map((value, x) => {
      if (!pathSet.has([x, y].join(','))) return '.';
      return value;
    })
  );

  const enclosed = new Set();

  matrix.forEach((line, y) => {
    line.forEach((el, x) => {
      if (el !== '.') return;
      let edges = checkEdges(line.slice(0, x));
      if (!(edges % 2)) return;
      enclosed.add([x, y].join(','));
    });
  });

  // console.log(
  //   matrix
  //     .map((line, y) => {
  //       return line
  //         .map((value, x) => {
  //           if (enclosed.has([x, y].join(','))) return '0';
  //           return value;
  //         })
  //         .join('');
  //     }).join('\n')
  // );

  return enclosed.size;
}

function checkEdges(line) {
  return line
    .join('')
    .replaceAll('-', '')
    .replaceAll(/(FJ|L7)/g, '|')
    .replaceAll('.', '').length;
}

console.log(first(data));
console.log(second(data));
