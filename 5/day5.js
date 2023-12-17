'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const seeds = parseSeeds(data);

  const lines = data.split('\n').slice(1);
  lines.forEach((line, i) => {
    if (!line) return;
    if (/\D/.test(line[0])) {
      // new category
      seeds.forEach((seed) => {
        seed.mapped = false;
        return seed;
      });
    } else if (/\d/.test(line[0])) {
      // mapping
      const [startDestination, startSource, range] = parseRange(line);
      seeds.forEach((seed) => {
        if (seed.mapped) return;
        if (seed.num >= startSource && seed.num < startSource + range) {
          seed.num += startDestination - startSource;
          seed.mapped = true;
        }
      });
    }
  });

  return seeds.reduce((acc, a) => (acc.num < a.num ? acc : a), -1).num;
}

function parseRange(data) {
  return data
    .trim()
    .split(' ')
    .map((num) => parseInt(num));
}

function parseSeeds(data) {
  return data
    .split('\n')[0]
    .split(':')[1]
    .trim()
    .split(' ')
    .map((seed) => {
      return {
        num: parseInt(seed),
        mapped: false,
      };
    });
}

function second(data) {
  const seeds = parseSeedRanges(data);

  const lines = data.split('\n').slice(1);
  lines.forEach((line, i) => {
    if (!line) return;
    if (/\D/.test(line[0])) {
      // new category
      seeds.forEach((seed) => {
        seed.mapped = false;
        return seed;
      });
    } else if (/\d/.test(line[0])) {
      // mapping
      const [startDestination, startSource, range] = parseRange(line);
      seeds.forEach((seed) => {
        if (seed.mapped) return;
        const previousNum = seed.num;
        const previousRange = seed.range;

        // if start is in the range
        if (seed.num >= startSource && seed.num < startSource + range) {
          seed.num += startDestination - startSource;
          seed.mapped = true;
          // if end is not in the range - divide the range
          if (previousNum + previousRange > startSource + range) {
            // make the current range smaller
            seed.range = startSource + range - previousNum;
            // add the rest to the seeds for the next line
            seeds.push({
              num: previousNum + seed.range,
              range: previousRange - seed.range,
              mapped: false,
            });
          }
        } else if (
          // if end is in the range even if start is not
          seed.num + seed.range >= startSource &&
          seed.num + seed.range < startSource + range
        ) {
          // divide the range - make the current range smaller
          seed.range = startSource - seed.num;
          // add the rest mapped to the seeds
          seeds.push({
            num: startDestination,
            range: previousRange - seed.range,
            mapped: true,
          });
        }
      });
    }
  });

  return seeds.reduce((acc, a) => (acc.num < a.num ? acc : a), -1).num;
}

function parseSeedRanges(data) {
  const seeds = [];
  const seedInput = data.split('\n')[0].split(':')[1].trim().split(' ');
  seedInput.forEach((el, i) => {
    if (i % 2) return;
    seeds.push({
      num: parseInt(el),
      range: parseInt(seedInput[i + 1]),
      mapped: false,
    });
  });
  return seeds;
}

console.log(first(data));
console.log(second(data));
