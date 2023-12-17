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
    const matchingNums = checkMatchingNums(line);
    sum += countPoints(matchingNums);
  });
  return sum;
}

function second(data) {
  const cards = data.split('\n').map((line) => {
    return {
      n: 1,
      matches: checkMatchingNums(line),
    };
  });

  let allCards = 0;
  cards.forEach((card, i) => {
    while (card.matches) {
      cards[i + card.matches].n += card.n;
      card.matches -= 1;
    }
    allCards += card.n;
  });
  return allCards;
}

function checkMatchingNums(input) {
  const parsedInput = input
    .split(':')[1]
    .split('|')
    .map((group) => group.split(' ').filter((n) => n));
  const winningNums = new Set(parsedInput[0]);
  return parsedInput[1].filter((num) => winningNums.has(num)).length;
}

function countPoints(n) {
  if (n === 0) return 0;
  return Math.pow(2, n - 1);
}

console.log(first(data));
console.log(second(data));
