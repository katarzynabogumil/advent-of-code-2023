'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;

  data.split('\n').forEach((line) => {
    let currentLine = line.split(' ').map((number) => parseInt(number));
    let lastNumsSum = currentLine.slice(-1)[0];

    while (currentLine.filter((a) => a).length) {
      currentLine = currentLine
        .map((num, i) => {
          if (i) return num - currentLine[i - 1];
        })
        .slice(1);
      lastNumsSum += currentLine.slice(-1)[0];
    }

    sum += lastNumsSum;
  });

  return sum;
}

function second(data) {
  let sum = 0;

  data.split('\n').forEach((line) => {
    let currentLine = line.split(' ').map((number) => parseInt(number));
    let previousNums = currentLine[0];
    let counter = 0;

    while (currentLine.filter((a) => a).length) {
      counter += 1;
      currentLine = currentLine
        .map((num, i) => {
          if (i) return num - currentLine[i - 1];
        })
        .slice(1);
      if (counter % 2) previousNums -= currentLine[0];
      else previousNums += currentLine[0];
    }

    sum += previousNums;
  });

  return sum;
}

console.log(first(data));
console.log(second(data));
