'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const matrix = expand(data);
  const galaxies = findGalaxies(matrix);

  let sum = 0;
  let checked = new Set();
  galaxies.forEach((galaxy1) => {
    galaxies.forEach((galaxy2) => {
      if (galaxy1 === galaxy2) return;
      if (checked.has(JSON.stringify([galaxy1, galaxy2]))) return;
      checked.add(JSON.stringify([galaxy1, galaxy2]));
      checked.add(JSON.stringify([galaxy2, galaxy1]));
      const [x1, y1] = galaxy1;
      const [x2, y2] = galaxy2;
      sum += Math.abs(x1 - x2) + Math.abs(y1 - y2);
    });
  });
  return sum;
}

function findGalaxies(matrix) {
  const galaxies = [];
  matrix.forEach((line, y) => {
    line.forEach((point, x) => {
      if (point === '#') galaxies.push([x, y]);
    });
  });
  return galaxies;
}

function expand(input) {
  // horizontal lines
  const lines = input.split('\n').map((line) => line.split(''));
  for (let j = 0; j < lines.length - 1; j++) {
    const galaxies = checkGalaxies(lines[j]);
    if (galaxies) continue;
    lines.splice(
      j + 1,
      0,
      lines[j].map(() => '.')
    );
    j++;
  }

  // reverse rows and columns
  const transposedLines = transpose(lines);
  // vertical lines
  for (let i = 0; i < transposedLines.length - 1; i++) {
    const galaxies = checkGalaxies(transposedLines[i]);
    if (galaxies) continue;
    transposedLines.splice(
      i + 1,
      0,
      transposedLines[i].map(() => '.')
    );
    i++;
  }

  return transpose(transposedLines);
}

function checkGalaxies(line) {
  return line.filter((el) => el === '#').length;
}

function transpose(input) {
  return Object.keys(input[0]).map((i) => {
    return input.map((line) => {
      return line[i];
    });
  });
}

function second(data) {
  const matrix = data.split('\n').map((line) => line.split(''));
  const galaxies = findGalaxies(matrix);
  const emptyRows = findEmptyRows(matrix);
  const transposedMatrix = transpose(matrix);
  const emptyColumns = findEmptyRows(transposedMatrix);

  let sum = 0;
  let checked = new Set();
  galaxies.forEach((galaxy1) => {
    galaxies.forEach((galaxy2) => {
      if (galaxy1 === galaxy2) return;
      if (checked.has(JSON.stringify([galaxy1, galaxy2]))) return;
      checked.add(JSON.stringify([galaxy1, galaxy2]));
      checked.add(JSON.stringify([galaxy2, galaxy1]));
      const [x1, y1] = galaxy1;
      const [x2, y2] = galaxy2;

      emptyRows.forEach((y) => {
        if (y1 > y && y2 > y) return;
        if (y1 < y && y2 < y) return;
        sum += 1000000 - 1;
      });

      emptyColumns.forEach((x) => {
        if (x1 > x && x2 > x) return;
        if (x1 < x && x2 < x) return;
        sum += 1000000 - 1;
      });

      sum += Math.abs(x1 - x2) + Math.abs(y1 - y2);
    });
  });

  return sum;
}

function findEmptyRows(matrix) {
  const rows = [];
  matrix.forEach((line, i) => {
    const empty = !line.filter((el) => el === '#').length;
    if (empty) rows.push(i);
  });
  return rows;
}

console.log(first(data));
console.log(second(data));
