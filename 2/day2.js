const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  lines = data.split('\n');
  const results = new Set([...Array(lines.length).keys()].map((i) => i + 1));

  const allCubes = {
    red: 12,
    green: 13,
    blue: 14,
  };

  lines.forEach((line, i) => {
    for (let [color, maxCubes] of Object.entries(allCubes)) {
      const colorCubes = line.match(
        new RegExp('\\d+(?=\\s' + color + ')', 'g'),
      );
      for (let num of colorCubes) {
        if (num > maxCubes) {
          results.delete(i + 1);
          break;
        }
      }
      if (!results.has(i + 1)) break;
    }
  });

  return [...results].reduce((acc, a) => acc + a, 0);
}

function second(data) {
  let sum = 0;

  data.split('\n').forEach((line) => {
    const maxCubes = {
      red: 0,
      green: 0,
      blue: 0,
    };

    Object.keys(maxCubes).forEach((color) => {
      line.match(new RegExp('\\d+(?=\\s' + color + ')', 'g')).forEach((n) => {
        const num = parseInt(n);
        if (num > maxCubes[color]) maxCubes[color] = num;
      });
    });

    sum += Object.values(maxCubes).reduce((acc, a) => acc * a, 1);
  });

  return sum;
}

console.log(first(data));
console.log(second(data));
