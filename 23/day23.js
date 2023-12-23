'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const { start, end, matrix } = parseInput(data);
  return findLongestPath(matrix, start, end);
}

function parseInput(data) {
  let start;
  let end;
  const lines = data.split('\n');
  const matrix = lines.map((line, y) =>
    line.split('').map((v, x) => {
      const isWall = v === '#';
      const point = new Node(x, y, v);
      if (!isWall && y === 0) start = point;
      if (!isWall && y === lines.length - 1) end = point;
      return point;
    })
  );
  return { start, end, matrix };
}

class Node {
  constructor(x, y, value, steps = 0, visited = new Map(), prev) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.steps = steps;
    this.visited = visited;
    this.prev = prev;
  }
}

// using Dijkstra with modification
function findLongestPath(matrix, start, end) {
  const q = new Map();
  const visited = new Map();
  let found = [];
  start.visited.set(str([start.x, start.y]), 1);
  q.set(str([start.x, start.y]), 1);

  while (q.size) {
    const nodeStr = findHighestStep(q);
    const [x, y] = unStr(nodeStr);
    const node = matrix[y][x];
    q.delete(nodeStr);

    if (node.x === end.x && node.y === end.y) {
      found.push(
        new Node(
          node.x,
          node.y,
          node.value,
          node.steps,
          node.visited,
          node.prev
        )
      );
    } else {
      // find further steps
      let nextSteps = findNextSteps(node, matrix);
      nextSteps.forEach((step) => {
        const strStep = str([step.x, step.y]);
        let strVisitedStep = strVisited(
          [step.x, step.y],
          [step.prev.x, step.prev.y]
        );
        if (visited.get(strVisitedStep) === step.steps) return;
        visited.set(strVisitedStep, step.steps);
        q.set(strStep, step.steps);
      });
    }
  }

  let bestNode = found.length
    ? found.reduce((acc, a) => (acc.steps > a.steps ? acc : a))
    : 0;
  return bestNode?.steps;
}

function findHighestStep(q) {
  let max = -Infinity;
  let maxNode;
  for (const [node, steps] of q) {
    if (steps > max) {
      max = steps;
      maxNode = node;
    }
  }
  return maxNode;
}

function findNextSteps(node, matrix) {
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

      let nextNode = matrix[col][row];
      if (nextNode.value === '#') continue;

      // not allow going up the slope
      if (nextNode.value === '>' && node.x - 1 === nextNode.x) continue;
      if (nextNode.value === '<' && node.x + 1 === nextNode.x) continue;
      if (nextNode.value === 'v' && node.y - 1 === nextNode.y) continue;

      nextNode.steps = node.steps + 1;
      nextNode.prev = node;

      nextSteps.push(nextNode);
    }
  }
  return nextSteps;
}

function str(point) {
  return point.join(',');
}

function strVisited(point, prevPoint, steps) {
  return [point.join(','), prevPoint.join(','), steps].join(' ');
}

function unStr(point) {
  return point.split(',').map((x) => parseInt(x));
}

let startTime = performance.now();
console.log(first(data));
let endTime = performance.now();
console.log(`Execution time: ${endTime - startTime} ms`);
