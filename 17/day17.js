'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function solve(data, part) {
  const matrix = data.split('\n').map((line) => line.split(''));
  let start = [0, 0];
  let end = [matrix[0].length - 1, matrix.length - 1];
  return findShortestPath(matrix, start, end, part);
}

class Node {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.straightSteps = 0;
    this.previousSteps = 0; // for part 2
    this.heat = Infinity;
    this.prev = undefined;
  }
}

// using Dijkstra with modification
function findShortestPath(matrix, [a, b], [x, y], part) {
  let start = new Node(a, b, parseInt(matrix[b][a]));
  let end;

  let q = [start];
  start.heat = 0;
  let visited = new Set();

  while (q.length) {
    let nodeIdx = findLowestStep(q);
    let node = q[nodeIdx];
    q.splice(nodeIdx, 1);

    if (node.x === x && node.y == y) {
      if (part === 1 || node.straightSteps >= 4) {
        end = node;
        break;
      }
    }

    // find further steps
    let nextSteps;
    if (part === 1) nextSteps = findNextStepsPart1(node, matrix);
    if (part === 2) nextSteps = findNextStepsPart2(node, matrix);

    nextSteps.forEach((step) => {
      // save point including information about previous path
      const strStep = str(
        [step.x, step.y],
        [node.x, node.y],
        step.straightSteps
      );
      if (visited.has(strStep)) return;
      visited.add(strStep);
      step.heat = node.heat + step.value;
      step.prev = node;
      q.push(step);
    });
  }

  return end?.heat || 0;
}

function findLowestStep(queue) {
  let min = Infinity;
  let i = -1;
  queue.forEach((node, j) => {
    if (node.heat < min) {
      min = node.heat;
      i = j;
    }
  });
  return i;
}

function findNextStepsPart1(node, matrix) {
  let nextSteps = [];
  let sizeX = matrix[0].length;
  let sizeY = matrix.length;
  for (
    let row = Math.max(node.x - 1, 0);
    row < Math.min(node.x + 2, sizeX);
    row++
  ) {
    for (
      let col = Math.max(node.y - 1, 0);
      col < Math.min(node.y + 2, sizeY);
      col++
    ) {
      // no reverse
      if (node.prev && row === node.prev.x && col === node.prev.y) continue;
      // no same node
      if (row === node.x && col === node.y) continue;
      // no diagonals
      if (row !== node.x && col !== node.y) continue;

      let nextNode = new Node(row, col, parseInt(matrix[col][row]));

      // check straight line
      if (
        node.prev &&
        ((row === node.prev.x && row === node.x) ||
          (col === node.prev.y && col === node.y))
      )
        nextNode.straightSteps = Math.max(node.straightSteps + 1, 2);
      else if (row === node.x || col === node.y) nextNode.straightSteps = 1;
      if (nextNode.straightSteps > 3) continue;

      nextSteps.push(nextNode);
    }
  }
  return nextSteps;
}

function findNextStepsPart2(node, matrix) {
  let nextSteps = [];
  let sizeX = matrix[0].length;
  let sizeY = matrix.length;
  for (
    let row = Math.max(node.x - 1, 0);
    row < Math.min(node.x + 2, sizeX);
    row++
  ) {
    for (
      let col = Math.max(node.y - 1, 0);
      col < Math.min(node.y + 2, sizeY);
      col++
    ) {
      // no reverse
      if (node.prev && row === node.prev.x && col === node.prev.y) continue;
      // no same node
      if (row === node.x && col === node.y) continue;
      // no diagonals
      if (row !== node.x && col !== node.y) continue;

      let nextNode = new Node(row, col, parseInt(matrix[col][row]));
      nextNode.previousSteps = node.previousSteps + 1;

      // check straight line
      if (
        node.prev &&
        ((row === node.prev.x && row === node.x) ||
          (col === node.prev.y && col === node.y))
      )
        nextNode.straightSteps = Math.max(node.straightSteps + 1, 2);
      else if (row === node.x || col === node.y) nextNode.straightSteps = 1;
      if (nextNode.straightSteps > 10) continue;

      // if first 4 steps
      if (
        node.prev &&
        nextNode.previousSteps < 4 &&
        ((row !== node.x && node.prev.x === node.x) ||
          (col !== node.y && node.prev.y === node.y))
      )
        continue;

      // if no 4 steps straight yet
      if (
        nextNode.previousSteps >= 4 &&
        node.straightSteps < 4 &&
        ((row !== node.x && node.prev.x === node.x) ||
          (col !== node.y && node.prev.y === node.y))
      )
        continue;

      nextSteps.push(nextNode);
    }
  }
  return nextSteps;
}

function str(point, prevPoint, steps) {
  return [point.join(','), prevPoint.join(','), steps].join(' ');
}

// const start = performance.now();
console.log(solve(data, 1));
// const end = performance.now();
// console.log(`Execution time: ${end - start} ms`);

const start = performance.now();
console.log(solve(data, 2));
const end = performance.now();
console.log(`Execution time: ${end - start} ms`);
