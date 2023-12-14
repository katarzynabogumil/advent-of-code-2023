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
    cycle(lines);

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
    cycle(lines);
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

function north(lines) {
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
}

/*
// First, I reused the north function to check the result,
// but then wrote the new ones to speed it up slightly.
// Note: These are pure, so for them to work 'north' has to return lines
// lines have to be reassigned each time in 'second' function.

function cycle(lines) {
  return east(south(west(north(lines))));
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
*/

function cycle(lines) {
  north(lines);
  west(lines);
  south(lines);
  east(lines);
}

function west(lines) {
  lines.forEach((line, j) => {
    line.forEach((value, i) => {
      if (value !== 'O') return;
      let lastFixed = Math.max(
        line.slice(0, i).lastIndexOf('#') + 1,
        line.slice(0, i).lastIndexOf('O') + 1
      );

      lines[j][i] = '.';
      lines[j][lastFixed] = 'O';
    });
  });
}

function south(lines) {
  const columns = transpose(lines);
  for (let j = lines.length - 1; j >= 0; j--) {
    const line = lines[j];
    line.forEach((value, i) => {
      if (value !== 'O') return;
      const column = columns[i];
      let fixedRock = column.slice(j + 1).findIndex((x) => x === '#');
      let movableRock = column.slice(j + 1).findIndex((x) => x === 'O');
      let firstFixed = Math.min(
        j + (fixedRock !== -1 ? fixedRock : Infinity),
        j + (movableRock !== -1 ? movableRock : Infinity)
      );
      if (firstFixed >= lines.length) firstFixed = lines.length - 1;

      // move in rows
      lines[j][i] = '.';
      lines[firstFixed][i] = 'O';

      // move in columns
      columns[i][j] = '.';
      columns[i][firstFixed] = 'O';
    });
  }
}

function east(lines) {
  lines.forEach((line, j) => {
    for (let i = line.length - 1; i >= 0; i--) {
      const value = line[i];
      if (value !== 'O') continue;
      let fixedRock = line.slice(i + 1).findIndex((x) => x === '#');
      let movableRock = line.slice(i + 1).findIndex((x) => x === 'O');
      let firstFixed = Math.min(
        i + (fixedRock !== -1 ? fixedRock : Infinity),
        i + (movableRock !== -1 ? movableRock : Infinity)
      );
      if (firstFixed >= line.length) firstFixed = line.length - 1;

      lines[j][i] = '.';
      lines[j][firstFixed] = 'O';
    }
  });
}

console.log(first(data));

// const start = performance.now();
console.log(second(data));
// const end = performance.now();
// console.log(`Execution time: ${end - start} ms`);
