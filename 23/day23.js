'use strict';

const fs = require('fs');
const { constrainedMemory } = require('process');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

class Node {
  constructor(x, y, value, steps = 0, prev) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.steps = steps;
    this.prev = prev;
  }
}

const [START, END, MATRIX] = parseInput(data);

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
  return [start, end, matrix];
}

function first() {
  const q = new Map();
  const visited = new Map();
  let found = [];
  visited.set(str([START.x, START.y]), 1);
  q.set(str([START.x, START.y]), 1);

  while (q.size) {
    const nodeStr = findHighestStep(q);
    const [x, y] = unStr(nodeStr);
    const node = MATRIX[y][x];
    q.delete(nodeStr);

    if (node.x === END.x && node.y === END.y) {
      found.push(new Node(node.x, node.y, node.value, node.steps, node.prev));
    } else {
      // find further steps
      let nextSteps = findNextSteps(node, 1);
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

function findNextSteps(node, part) {
  let nextSteps = [];
  let sizeX = MATRIX[0].length;
  let sizeY = MATRIX.length;
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
      if (part !== 'subpath') {
        if (node.prev && row === node.prev.x && col === node.prev.y) continue;
      }

      // no same node
      if (row === node.x && col === node.y) continue;

      // no diagonals
      if (row !== node.x && col !== node.y) continue;

      let nextNode = MATRIX[col][row];
      if (nextNode.value === '#') continue;

      // not allow going up the slope
      if (part === 1) {
        if (nextNode.value === '>' && node.x - 1 === nextNode.x) continue;
        if (nextNode.value === '<' && node.x + 1 === nextNode.x) continue;
        if (nextNode.value === 'v' && node.y - 1 === nextNode.y) continue;
      }

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

class SubPath {
  constructor(endX, endY) {
    this.endX = endX;
    this.endY = endY;
    this.next = this.findNext();
  }

  findNext() {
    let next = [];
    const q = new Map();
    const visited = new Map();
    const firstSteps = findNextSteps(MATRIX[this.endY][this.endX], 'subpath');
    firstSteps.forEach((step) => q.set(str([step.x, step.y]), 1));

    while (q.size) {
      const nodeStr = q.keys().next().value;
      const [x, y] = unStr(nodeStr);
      visited.set(nodeStr, 0);
      const node = MATRIX[y][x];
      const steps = q.get(nodeStr);
      q.delete(nodeStr);

      const nextSteps = findNextSteps(node);
      if (nextSteps.length === 1 && (node.x !== END.x || node.y !== END.y)) {
        const step = nextSteps[0];
        let strStep = str([step.x, step.y]);
        if (!visited.has(strStep)) q.set(strStep, steps + 1);
      } else {
        next.push([str([node.x, node.y]), steps]);
      }
    }
    return next;
  }
}

function parseGraph() {
  const q = new Map();
  const graph = new Map();
  const visited = new Map();
  const startStr = str([START.x, START.y]);
  graph.set(startStr, new SubPath(START.x, START.y));
  q.set(startStr, 1);
  let node;
  let nextSteps;

  while (q.size) {
    const nodeStr = q.keys().next().value;
    const [x, y] = unStr(nodeStr);
    visited.set(nodeStr, 0);
    node = MATRIX[y][x];
    q.delete(nodeStr);

    // find further steps
    nextSteps = findNextSteps(node);
    if (nextSteps.length === 1 && (node.x !== END.x || node.y !== END.y)) {
      const step = nextSteps[0];
      let strStep = str([step.x, step.y]);
      if (!visited.has(strStep)) q.set(strStep, 1);
    } else {
      // save in the graph
      const path = new SubPath(node.x, node.y);
      nextSteps.forEach((next) => {
        const nextStr = str([next.x, next.y]);
        if (!visited.has(nextStr)) q.set(nextStr, 1);
      });
      graph.set(nodeStr, path);
    }
  }

  return graph;
}

class PathStep {
  constructor(key, steps = 0, visited = new Map()) {
    this.key = key;
    this.steps = steps;
    this.visited = visited;
  }
}

function second() {
  const graph = parseGraph();

  let max = 0;
  const startKey = graph.keys().next().value;
  const stack = [new PathStep(startKey)];

  while (stack.length) {
    const pathStep = stack.pop();
    pathStep.visited.set(pathStep.key, pathStep.steps);
    const path = graph.get(pathStep.key);

    if (path.endX === END.x && path.endY === END.y) {
      max = Math.max(max, pathStep.steps);
      console.log(max);
    }

    path.next.forEach(([nextKey, steps]) => {
      if (pathStep.visited.has(nextKey)) return;
      const nextPath = graph.get(nextKey);
      if (!nextPath) return;
      let newStep = new PathStep(
        nextKey,
        pathStep.steps + steps,
        new Map(pathStep.visited)
      );
      stack.push(newStep);
    });
  }

  return max;
}

let startTime = performance.now();
// console.log(first());
let endTime = performance.now();
// console.log(`Execution time: ${endTime - startTime} ms`);

startTime = performance.now();
console.log(second());
endTime = performance.now();
console.log(`Execution time: ${endTime - startTime} ms`);
