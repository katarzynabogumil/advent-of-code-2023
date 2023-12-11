'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

// const data = `FF7FSF7F7F7F7F7F---7
// L|LJ||||||||||||F--J
// FL-7LJLJ||||||LJL-77
// F--JF--7||LJLJ7F7FJ-
// L---JF-JLJ.||-FJLJJ7
// |F|F-JF---7F7-L7L|7|
// |FFJF7L7F-JF7|JL---7
// 7-L-JL7||F7|L7F-7F7|
// L.L7LFJ|||||FJL7||LJ
// L7JLJL-JLJLJL--JLJ.L`;

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

/*
First try using the broaden the gaps and fill idea.
*/

function second(data) {
  const input = parseInput(data);
  const path = findPath(input); // changed part one

  // get rid of all pipes not in path
  const pathSet = new Set(path.map((el) => el.join(',')));
  const initialMatrix = input.map((line, y) =>
    line.map((value, x) => {
      if (!pathSet.has([x, y].join(','))) return '.';
      return value;
    })
  );

  // broaden the spaces between the edges and adjust path
  let matrix = addEmptyLines(initialMatrix);

  let enclosed = new Set();
  let allBlacklist = new Set();

  // find blacklist
  matrix.forEach((line, y) =>
    line.forEach((_, x) => {
      if (
        x !== 0 &&
        x !== line.length - 1 &&
        y !== 0 &&
        y !== matrix.length - 1
      )
        return;
      const point = [x, y].join(',');
      if (matrix[y][x] !== '.' && matrix[y][x] !== 'X') return;
      if (allBlacklist.has(point)) return;
      let blackList = checkOpen(matrix, [x, y], allBlacklist);
      allBlacklist = new Set([...allBlacklist, ...blackList]);
    })
  );

  // console.log(
  //   matrix
  //     .map((line, y) => {
  //       return line
  //         .map((value, x) => {
  //           if (allBlacklist.has([x, y].join(','))) return 'B';
  //           return value;
  //         })
  //         .join('');
  //     })
  //     .join('\n')
  // );

  // find enclosed
  matrix.forEach((line, y) => {
    line.forEach((value, x) => {
      const point = [x, y].join(',');
      if (allBlacklist.has(point)) return;
      if (value !== '.') return;
      enclosed.add(point);
    });
  });

  return enclosed.size;
}

function checkOpen(matrix, [i, j], blackList) {
  blackList.add([i, j].join(','));
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
      const point = [x, y].join(',');
      if (blackList.has(point)) continue;
      if (matrix[y][x] !== '.' && matrix[y][x] !== 'X') continue;

      const newBlackList = checkOpen(matrix, [x, y], blackList);
      blackList = new Set([...blackList, ...newBlackList]);
    }
  }
  return blackList;
}

function addEmptyLines(input) {
  // horizontal lines
  for (let j = 0; j < input.length - 1; j++) {
    const edges = findEdges(input[j], input[j + 1], 'horizontal');
    if (!edges.size) continue;

    input.splice(
      j + 1,
      0,
      input[j].map((el, i) => {
        if (edges.has(i)) return 'X';
        if (el === '.') return 'X';
        return el;
      })
    );
    j++;
  }

  // reverse rows and columns
  const transposedInput = transpose(input);

  // vertical lines
  for (let i = 0; i < transposedInput.length - 1; i++) {
    const edges = findEdges(
      transposedInput[i],
      transposedInput[i + 1],
      'vertical'
    );
    if (!edges.size) continue;

    transposedInput.splice(
      i + 1,
      0,
      transposedInput[i].slice().map((el, j) => {
        if (edges.has(j)) return 'X';
        if (el === '.') return 'X';
        return el;
      })
    );
    i++;
  }

  return transpose(transposedInput);
}

function findEdges(lineA, lineB, direction) {
  let edges = new Set();
  let edgesA = [];
  let edgesB = [];

  if (direction === 'horizontal') {
    edgesA = ['J', 'L', 'J', 'L', 'J', 'L', '-', '-', '-'];
    edgesB = ['7', 'F', 'F', '7', '-', '-', 'F', '7', '-'];
  } else {
    edgesA = ['J', '7', 'J', '7', 'J', '7', '|', '|', '|'];
    edgesB = ['L', 'F', 'F', 'L', '|', '|', 'F', 'L', '|'];
  }

  lineA.forEach((el, i) => {
    edgesA.forEach((a, j) => {
      if (
        (el === 'S' && edgesB.includes(lineB[i])) ||
        (lineB[i] === 'S' && edgesA.includes(el)) ||
        (el === a && lineB[i] === edgesB[j])
      )
        edges.add(i);
    });
  });

  return edges;
}

function transpose(input) {
  return Object.keys(input[0]).map((i) => {
    return input.map((line) => {
      return line[i];
    });
  });
}

console.log(first(data));
console.log(second(data));
