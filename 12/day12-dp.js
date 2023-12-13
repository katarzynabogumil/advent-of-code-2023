const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;

  data.split('\n').forEach((line) => {
    const lineArr = line.split(' ');
    const springs = lineArr[0].split('');
    const rules = lineArr[1].split(',').map((x) => parseInt(x));

    const solutions = inspectLine({
      springs,
      rules,
      broken: Array(rules.length).fill(0),
      start: 0,
      i: 0,
    });

    sum += solutions;
  });
  return sum;
}

function inspectLine({ springs, rules, broken, start, i }) {
  let solutions = 0;
  for (let j = start; j < springs.length; j++) {
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
      solutions += inspectLine({
        springs: springs.slice(),
        rules: rules.slice(),
        broken: broken.slice(),
        start: j + 1,
        i,
      });
    }

    // remove broken spring
    springs[j] = '.';
    broken[i]--;
    i = springs.join('').slice(0, j).match(/#+/g)?.length || 0;

    // check if solution valid
    if (broken.slice(0, i).join(',') !== rules.slice(0, i).join(','))
      return solutions;
  }

  // in case it we went out of bounds with . or # at the end
  if (!broken[broken.length - 1]) broken.pop();

  if (rules.join(',') === broken.join(',')) solutions++;
  return solutions;
}

/*
Backtracking from part one was too slow for this one.
I had to look for some inspiration and hints on reddit to use memoize,
so this solution doesn't feel completely mine.
In day12-backtracking I changed part one to work also for part two, 
using memoize with the initial backtracking function with small changes.
*/

function second(data) {
  let sum = 0;
  data.split('\n').forEach((line) => {
    const lineArr = line.split(' ');
    const springs = Array(5).fill(lineArr[0]).join('?');
    const rules = Array(5)
      .fill(lineArr[1])
      .join(',')
      .split(',')
      .map((x) => parseInt(x));

    const solutions = inspect(springs, rules);
    sum += solutions;
  });
  return sum;
}

function memoize(func) {
  let cache = new Map();
  return function (...args) {
    const key = args.join(',');
    if (!cache.has(key)) cache.set(key, func(...args));
    return cache.get(key);
  };
}

const inspect = memoize((springs, rules) => {
  if (!rules.length) {
    const noMoreBroken = !springs.match(/#+/g)?.length;
    if (noMoreBroken) return 1; // valid solution
    return 0;
  }
  if (!springs.length) return 0;

  // check if solution still possible
  const spaceNeeded = rules.reduce((a, b) => a + b, 0) + rules.length - 1;
  if (springs.length < spaceNeeded) return 0;

  const spring = springs[0];
  if (spring === '.') return inspect(springs.slice(1), rules);
  if (spring === '#') {
    const rule = rules[0];
    const workingSprings = springs.slice(0, rule).match(/\./g)?.length;
    if (workingSprings) return 0;
    if (springs[rule] === '#') return 0;
    return inspect(springs.slice(rule + 1), rules.slice(1));
  }

  // if spring is '?' inspect both
  return (
    inspect('.' + springs.slice(1), rules) +
    inspect('#' + springs.slice(1), rules)
  );
});

console.log(first(data));
console.log(second(data));
