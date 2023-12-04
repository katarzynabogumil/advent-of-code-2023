const fs = require('fs');

const testData = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`;

const testData2 = `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`;

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;

  data.split('\n').map((line) => {
    const numArr = line.match(/\d/g);
    sum += parseInt(numArr[0] + numArr.pop());
  });

  return sum;
}

function second(data) {
  const dict = {
    one: 1,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };
  const keys = Object.keys(dict);
  const keysSet = new Set(keys);

  let sum = 0;
  data.split('\n').map((line) => {
    const first = line
      .match(new RegExp('\\d|' + keys.join('|'), 'g'))
      .map((num) => {
        if (keysSet.has(num)) return '' + dict[num];
        return num;
      })[0];

    const last = reverse(line)
      .match(new RegExp('\\d|' + keys.map((l) => reverse(l)).join('|'), 'g'))
      .map((num) => {
        const reversedNum = reverse(num);
        if (keysSet.has(reversedNum)) return '' + dict[reversedNum];
        return num;
      })[0];

    sum += parseInt(first + last);
  });

  return sum;
}

function reverse(str) {
  return str.split('').reverse().join('');
}

console.log(first(data));
console.log(second(data));
