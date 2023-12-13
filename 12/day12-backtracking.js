const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

/*
I used backtracking without memoize for part one and 
after looking for inspiration and hints on reddit to use memoize 
and writing completely different recursive solution (day12-dp.js)
I came back to this one and tried to make it work for part two.
It is slower than day12-dp, as with more arguments it uses cache 
less often, but it works with my primary logic, too.
*/

function solve(data, part) {
  let sum = 0;

  data.split('\n').forEach((line) => {
    const lineArr = line.split(' ');
    let springs = lineArr[0].split('');
    let rules = lineArr[1].split(',').map((x) => parseInt(x));

    if (part === 2) {
      springs = Array(5).fill(lineArr[0]).join('?').split('');
      rules = Array(5)
        .fill(lineArr[1])
        .join(',')
        .split(',')
        .map((x) => parseInt(x));
    }

    const solutions = inspect({
      springs,
      rules,
      broken: Array(rules.length).fill(0),
      i: 0,
    });

    sum += solutions;
  });
  return sum;
}

const inspect = memoize(({ springs, rules, broken, i }) => {
  let solutions = 0;
  for (let j = 0; j < springs.length; j++) {
    const spring = springs[j];
    if (spring === '#') broken[i] = broken[i] + 1 || 1;
    if (spring === '.') {
      if (broken[i] > 0) {
        if (broken[i] < rules[i]) return solutions;
        i++;
      }
      broken[i] = 0;
    }
    if (spring !== '?') continue;

    // try with broken spring
    springs[j] = '#';
    broken[i] = broken[i] + 1 || 1;

    // increase solutions or inspect next elements in this config
    const isCorrect = rules.join(',') === broken.join(',');
    if (isCorrect) {
      const noMoreBroken = !springs
        .join('')
        .slice(j + 1)
        .match(/#+/g)?.length;
      if (noMoreBroken) solutions++;
    } else if (broken[i] <= rules[i]) {
      solutions += inspect({
        springs: springs.slice(j + 1),
        rules: rules.slice(),
        broken: broken.slice(),
        i,
      });
    }

    // remove broken spring
    springs[j] = '.';
    broken[i]--;
    if (broken[i] !== 0) i++;

    // check if solution valid
    if (broken.slice(0, i).join(',') !== rules.slice(0, i).join(','))
      return solutions;
  }

  // in case it we went out of bounds with . or # at the end
  if (!broken[broken.length - 1]) broken.pop();

  if (rules.join(',') === broken.join(',')) solutions++;
  return solutions;
});

function memoize(func) {
  let cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, func(...args));
    return cache.get(key);
  };
}

console.log(solve(data, 1));
console.log(solve(data, 2));
