'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const lines = data.split('\n');
  const instructions = lines[0];
  const nodes = parseNodes(lines.slice(2));

  let steps = 0;
  let found = false;
  let current = 'AAA';

  while (!found) {
    for (let i = 0; i < instructions.length; i++) {
      const direction = instructions[i];
      current = nodes[current][direction];
      steps += 1;
      if (current === 'ZZZ') {
        found = true;
        break;
      }
    }
  }
  return steps;
}

function parseNodes(lines) {
  const nodes = {};
  lines.forEach((line) => {
    const [value, L, R] = line.match(/\w+/g);
    nodes[value] = { L, R };
  });
  return nodes;
}

function second(data) {
  const lines = data.split('\n');
  const instructions = lines[0];
  const nodes = parseNodes(lines.slice(2));
  let currents = Object.keys(nodes).filter((node) => node[2] === 'A');
  let allSteps = [];

  currents.forEach((current) => {
    let steps = 0;
    let found = false;
    while (!found) {
      for (let i = 0; i < instructions.length; i++) {
        const direction = instructions[i];
        current = nodes[current][direction];
        steps += 1;
        if (current[2] === 'Z') {
          found = true;
          allSteps.push(steps);
        }
      }
    }
  });

  return allSteps.reduce(leastCommonMultiple);
}

// using Euclidean algorithm
function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function leastCommonMultiple(a, b) {
  return (a * b) / greatestCommonDivisor(a, b);
}

/*
Note: LCM could have been used only because in the input 
the distance from A to Z equals the next circle from Z to Z.
TO be honest, I analyzed a few first the circle lengths from the 
starting points and after noticing this, decided to go for LCM.
*/

console.log(first(data));
console.log(second(data));
