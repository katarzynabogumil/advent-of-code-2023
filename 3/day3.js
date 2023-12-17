'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;

  const lines = data.split('\n');
  lines.forEach((line, i) => {
    let num = '';
    let valid = false;

    line.split('').forEach((char, j) => {
      if (/\d/.test(char)) {
        num += char;
        if (!valid) valid = validatePart1(new RegExp(/[^0-9.]/), lines, i, j);
      }

      if (!/\d/.test(char) || j === line.length - 1) {
        if (num && valid) {
          sum += parseInt(num);
        }
        num = '';
        valid = false;
      }
    });
  });

  return sum;
}

function second(data) {
  let gears = {};
  const lines = data.split('\n');
  lines.forEach((line, i) => {
    let num = '';
    let currentGears = new Set();

    line.split('').forEach((char, j) => {
      if (/\d/.test(char)) {
        num += char;
        validatePart2(new RegExp(/\*/), lines, i, j).forEach((gear) => {
          if (gear) currentGears.add(gear);
        });
      }

      if (!/\d/.test(char) || j === line.length - 1) {
        if (num && currentGears.size) {
          currentGears.forEach((gear) => {
            if (!gears[gear]) gears[gear] = [];
            gears[gear].push(num);
          });
        }
        num = '';
        currentGears = new Set();
      }
    });
  });

  let sum = 0;
  Object.values(gears).forEach((numbers) => {
    if (numbers.length === 2)
      sum += parseInt(numbers[0]) * parseInt(numbers[1]);
  });
  return sum;
}

function validatePart1(regex, lines, i, j) {
  for (let a of [Math.max(i - 1, 0), i, Math.min(i + 1, lines.length - 1)]) {
    for (let b of [
      Math.max(j - 1, 0),
      j,
      Math.min(j + 1, lines[0].length - 1),
    ]) {
      if (regex.test(lines[a][b])) return true;
    }
  }
  return false;
}

function validatePart2(regex, lines, i, j) {
  let gears = new Set();
  for (let a of [Math.max(i - 1, 0), i, Math.min(i + 1, lines.length - 1)]) {
    for (let b of [
      Math.max(j - 1, 0),
      j,
      Math.min(j + 1, lines[0].length - 1),
    ]) {
      if (regex.test(lines[a][b])) return gears.add([a, b].join(','));
    }
  }
  return gears;
}

console.log(first(data));
console.log(second(data));
