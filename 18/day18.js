'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function solve(data, part) {
  const lines = data.split('\n');
  let x = 0;
  let y = 0;
  let edge = 0;
  const vertices = [];

  lines.forEach((line) => {
    let lineData = line.split(' ');
    let direction;
    let steps;

    if (part === 1) {
      direction = lineData[0];
      let stepsStr = lineData[1];
      steps = parseInt(stepsStr);
    } else if (part === 2) {
      let directions = { 0: 'R', 1: 'D', 2: 'L', 3: 'U' };
      let hex = lineData[2].replace(/[()#]/g, '');
      direction = directions[parseInt(hex.slice(-1), 16)];
      steps = parseInt(hex.slice(0, -1), 16);
    }

    edge += steps;
    switch (direction) {
      case 'R':
        x += steps;
        break;
      case 'L':
        x -= steps;
        break;
      case 'U':
        y -= steps;
        break;
      case 'D':
        y += steps;
        break;
    }

    vertices.push([x, y]);
  });

  let sum = 0;
  vertices.push(vertices[0]);
  for (let i = 0; i < vertices.length - 1; i++) {
    sum +=
      vertices[i][0] * vertices[i + 1][1] - vertices[i][1] * vertices[i + 1][0];
  }

  return (edge + Math.abs(sum)) / 2 + 1;
}

console.log(solve(data, 1));
console.log(solve(data, 2));
