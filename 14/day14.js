const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;
  const lines = data.split('\n').map((line) => line.split(''));
  const len = lines.length;
  const columns = transpose(lines);

  lines.forEach((line, j) => {
    line.forEach((value, i) => {
      if (value !== 'O') return;

      let start = 0;
      const column = columns[i];
      const lastFixedRock = column.slice(0, j).lastIndexOf('#');
      if (lastFixedRock !== -1) start = lastFixedRock + 1;

      const movableRocks =
        column.slice(start, j).join('').match(/O/g)?.length || 0;
      sum += len - (start + movableRocks);
    });
  });
  return sum;
}

function transpose(input) {
  return Object.keys(input[0]).map((i) => {
    return input.map((line) => {
      return line[i];
    });
  });
}

function second(data) {
  const cycles = 1000000000;
  let counter = 0;
  let lastCircles = 0;
  let cycleFound = false;
  let lines = data.split('\n').map((line) => line.split(''));
  const linesSet = new Set();
  const linesArr = [];

  while (counter <= cycles && !cycleFound) {
    counter++;
    lines = cycle(lines);

    const size = linesSet.size;
    const str = lines.map((line) => line.join('')).join('\n');
    linesSet.add(str);
    linesArr.push(str);

    if (size !== linesSet.size) continue;
    cycleFound = true;
    for (let i = 1; i < counter; i++) {
      if (linesArr[counter - 1] !== linesArr[i - 1]) continue;
      lastCircles = (cycles - i) % (counter - i);
      break;
    }
  }

  for (let _ = 0; _ < lastCircles; _++) {
    lines = cycle(lines);
  }

  let sum = 0;
  const len = lines.length;
  lines.forEach((line, j) => {
    line.forEach((value) => {
      if (value !== 'O') return;
      sum += len - j;
    });
  });

  return sum;
}

function cycle(input) {
  return east(south(west(north(input))));
}

function north(input) {
  const lines = input.slice().map((line) => line.slice());
  const columns = transpose(lines);
  lines.forEach((line, j) => {
    line.forEach((value, i) => {
      if (value !== 'O') return;
      const column = columns[i];
      const lastFixed = Math.max(
        column.slice(0, j).lastIndexOf('#') + 1,
        column.slice(0, j).lastIndexOf('O') + 1,
        0
      );

      // move in rows
      lines[j][i] = '.';
      lines[lastFixed][i] = 'O';

      // move in columns
      columns[i][j] = '.';
      columns[i][lastFixed] = 'O';
    });
  });
  return lines;
}

function west(lines) {
  const transposed = transpose(lines);
  return transpose(north(transposed));
}

function south(lines) {
  const reversed = lines.reverse();
  return north(reversed).reverse();
}

function east(lines) {
  const transposed = transpose(lines.map((line) => line.reverse()));
  return transpose(north(transposed)).map((line) => line.reverse());
}

console.log(first(data));
console.log(second(data));
