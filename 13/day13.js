const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function solve(data, check) {
  let sum = 0;
  const lines = data.split('\n');
  let block = [];
  lines.forEach((line, i) => {
    if (line.length || i === lines.length - 1) {
      block.push(line);
      if (i !== lines.length - 1) return;
    }

    let rows = check(block);
    if (rows) {
      sum += 100 * rows;
      block = [];
      return;
    }

    let columns = check(transpose(block));
    sum += columns;
    block = [];
  });
  return sum;
}

function checkRowsPart2(lines) {
  const oldLine = checkRowsPart1(lines);

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[0].length; x++) {
      const char = lines[y][x];
      lines[y] = lines[y].split('');
      lines[y][x] = char === '.' ? '#' : '.';
      lines[y] = lines[y].join('');

      const foundRows = checkRows(lines).filter((x) => x !== oldLine);
      if (foundRows.length) return foundRows[0];

      lines[y] = lines[y].split('');
      lines[y][x] = char;
      lines[y] = lines[y].join('');
    }
  }
  return 0;
}

function checkRowsPart1(lines) {
  const symmetryAxis = checkRows(lines);
  return symmetryAxis.length ? checkRows(lines)[0] : 0;
}

function checkRows(lines) {
  const symmetryAxis = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i] === lines[i + 1]) {
      const foundSymmetry = checkSymmetry(lines, i);
      if (foundSymmetry) symmetryAxis.push(foundSymmetry);
    }
  }
  return symmetryAxis;
}

function checkSymmetry(lines, i) {
  for (let j = i - 1; j >= 0 && i + 1 + (i - j) < lines.length; j--) {
    if (lines[j] !== lines[i + 1 + (i - j)]) return 0;
  }
  return i + 1;
}

function transpose(input) {
  return Object.keys(input[0].split('')).map((i) => {
    return input
      .map((line) => {
        return line[i];
      })
      .join('');
  });
}

console.log(solve(data, checkRowsPart1));
console.log(solve(data, checkRowsPart2));
