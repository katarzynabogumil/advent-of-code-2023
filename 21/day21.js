'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

const [START, MATRIX] = parseInput(data);

function first(steps, start = [str(START)]) {
  let q = new Map(start.map((x) => [x, 0]));
  const visited = new Map();
  const marked = new Map();

  for (const [point, step] of q) {
    if (visited.has(point)) continue;
    if (step > steps) continue;
    visited.set(point, step);
    if (step % 2 === steps % 2) marked.set(point, step);

    findNext(point).forEach((next) => {
      if (!visited.has(next) && !q.has(next)) q.set(next, step + 1);
    });
  }

  // console.log(
  //   MATRIX.map((line, y) =>
  //     line
  //       .map((v, x) => {
  //         if (marked.has(str([x, y]))) return '0';
  //         return v;
  //       })
  //       .join('')
  //   ).join('\n')
  // );

  return marked.size;
}

function findNext(point) {
  const [i, j] = unStr(point);
  const next = [];
  for (
    let y = Math.max(0, j - 1);
    y <= Math.min(j + 1, MATRIX.length - 1);
    y++
  ) {
    for (
      let x = Math.max(0, i - 1);
      x <= Math.min(i + 1, MATRIX[0].length - 1);
      x++
    ) {
      if (x !== i && y !== j) continue;
      if (x === i && y === j) continue;
      if (MATRIX[y][x] === '#') continue;
      next.push(str([x, y]));
    }
  }
  return next;
}

function parseInput(data) {
  let startPoint;
  const matrix = data.split('\n').map((line, y) => {
    const arr = line.split('');
    arr.forEach((v, x) => {
      if (v === 'S') startPoint = [x, y];
    });
    return arr;
  });
  return [startPoint, matrix];
}

function str([x, y]) {
  return [x, y].join(',');
}
function unStr(point) {
  return point.split(',').map((x) => parseInt(x));
}

function second(steps) {
  const len = MATRIX.length;
  let lengths = 1 + 2 * Math.floor((steps - Math.floor(len / 2)) / len);

  // assumptions based on the input
  const left = (steps - Math.floor(len / 2)) % len;
  if (left) return;
  if (((lengths - 1) / 2) % 2) return;

  let half = Math.floor(len / 2);
  const pointsEven = first(len - 1); // 7688
  const pointsOdd = first(len); // 7656
  const pointsInnerDiamond = first(half); // 3877
  const starts = [
    [0, 0],
    [130, 130],
    [130, 0],
    [0, 130],
  ].map((x) => str(x));
  const pointsOuterDiamond = first(half - 1, starts); // 3920

  const timesInnerDiamond = (lengths + 1) / 2;
  const timesOuterDiamond = (lengths - 1) / 2;
  const timesFullEven = Math.pow(Math.round((lengths - 2) / 2), 2);
  const timesFullOdd = Math.pow(Math.floor((lengths - 2) / 2), 2);
  const timesFullOddFromDiamond = (timesInnerDiamond - 2) * 3 + 2;

  return (
    pointsEven * timesFullEven +
    pointsOdd * (timesFullOdd + timesFullOddFromDiamond) +
    pointsInnerDiamond * timesInnerDiamond +
    pointsOuterDiamond * timesOuterDiamond
  );
}

let startTime = performance.now();
console.log(first(64));
let endTime = performance.now();
console.log(`Execution time: ${endTime - startTime} ms`);

let steps = 26501365;
startTime = performance.now();
console.log(second(steps));
endTime = performance.now();
console.log(`Execution time: ${endTime - startTime} ms`);
