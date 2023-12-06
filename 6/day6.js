const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let result = 1;
  const races = parseInputPart1(data);

  races.forEach((race) => {
    let possibilities = 0;
    const minTime = Math.round(race.distance / race.time);
    for (let i = minTime; i < race.time - minTime; i++) {
      const distance = i * (race.time - i);
      if (distance > race.distance) possibilities += 1;
    }
    result *= possibilities;
  });

  return result;
}

function second(data) {
  const race = parseInputPart2(data);
  let firstPossibility = 0;

  const minTime = Math.round(race.distance / race.time);
  for (let i = minTime; i < race.time - minTime; i++) {
    const distance = i * (race.time - i);
    if (distance > race.distance) {
      firstPossibility = i;
      break;
    }
  }

  return race.time - 2 * firstPossibility + 1;
}

function parseInputPart1(data) {
  const lines = data.split('\n');
  const times = lines[0].match(/\d+/g);
  const distances = lines[1].match(/\d+/g);
  return times.map((time, i) => {
    return {
      time: parseInt(time),
      distance: parseInt(distances[i]),
    };
  });
}

function parseInputPart2(data) {
  const lines = data.split('\n');
  const time = lines[0].match(/\d+/g).join('');
  const distance = lines[1].match(/\d+/g).join('');
  return {
    time: parseInt(time),
    distance: parseInt(distance),
  };
}

console.log(first(data));
console.log(second(data));
