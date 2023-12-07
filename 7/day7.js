const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function countWinnings(data, getRank, cardValues) {
  const sorted = parseLines(data, getRank).sort((a, b) => {
    // sort by rank
    if (a.rank < b.rank) return -1;
    else if (a.rank > b.rank) return 1;

    // sort by cards if type ranks are the same
    for (let i = 0; i < a.hand.length; i++) {
      const cardRankA = getCardRank(a.hand[i], cardValues);
      const cardRankB = getCardRank(b.hand[i], cardValues);
      if (cardRankA < cardRankB) return -1;
      else if (cardRankA > cardRankB) return 1;
    }
    return 0;
  });

  return sorted.reduce((acc, a, i) => {
    return acc + a.bid * (i + 1);
  }, 0);
}

function parseLines(data, getRank) {
  return data.split('\n').map((line) => {
    const hand = line.split(' ')[0];
    return {
      hand,
      rank: getRank(hand),
      bid: parseInt(line.split(' ')[1]),
    };
  });
}

function getTypeRankPart1(hand) {
  const set = new Set(hand);
  if (set.size === 1) return 6; // five
  if (set.size === 2 && maxTimes(hand, set) === 4) return 5; //  four
  if (set.size === 2) return 4; // full house
  if (set.size === 3 && maxTimes(hand, set) === 3) return 3; // three
  if (set.size === 3) return 2; // two pairs
  if (set.size === 4) return 1; // one pair
  return 0;
}

function getTypeRankPart2(hand) {
  const jokers = hand.match(/J{1}/g);
  if (!jokers) return getTypeRankPart1(hand);

  const handWithoutJ = hand.replace(/J/g, '');
  const set = new Set(handWithoutJ);
  if (set.size === 1) return 6; // five

  switch (jokers.length) {
    case 5:
    case 4:
      return 6; // five
    case 3:
      return 5; // four
    case 2:
      if (maxTimes(handWithoutJ, set) === 2) return 5; // four}
      return 3; // three
    default:
      if (maxTimes(handWithoutJ, set) === 3) return 5; //  four
      if (set.size === 2) return 4; // full house
      if (set.size === 3 && maxTimes(handWithoutJ, set) === 2) return 3; // three
      return 1; // one pair
  }
}

function maxTimes(hand, elements) {
  let max = 0;
  [...elements].forEach((el) => {
    let num = [...hand].reduce((acc, a) => (acc += a === el ? 1 : 0), 0);
    if (num > max) max = num;
  });
  return max;
}

function getCardRank(card, cardObj) {
  return cardObj[card] || parseInt(card);
}

const CARDS_PART_1 = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
};

const CARDS_PART_2 = {
  A: 14,
  K: 13,
  Q: 12,
  T: 10,
  J: 1,
};

console.log(countWinnings(data, getTypeRankPart1, CARDS_PART_1));
console.log(countWinnings(data, getTypeRankPart2, CARDS_PART_2));
