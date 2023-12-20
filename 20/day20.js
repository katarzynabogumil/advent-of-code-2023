'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const modules = parseInput(data);
  let cycles = 1000;
  let low = 0;
  let high = 0;

  while (cycles) {
    let q = [{ name: 'button', pulse: 'low' }];

    while (q.length) {
      let { name, pulse, previous } = q.shift();
      let current = modules.get(name);
      if (!current) continue;

      switch (name) {
        case 'button':
          low++;
          q.push({ name: 'broadcaster', pulse: 'low', previous: name });
          break;
        case 'broadcaster':
          low += current.next.length;
          q = q.concat(
            current.next.map((x) => {
              return { name: x, pulse, previous: name };
            })
          );
          break;
        default:
          if (current.type === '%') {
            if (pulse === 'high') break;
            let nextPulse = 'high';
            if (current.on) nextPulse = 'low';
            current.on = !current.on;

            low += nextPulse === 'low' ? current.next.length : 0;
            high += nextPulse === 'high' ? current.next.length : 0;

            q = q.concat(
              current.next.map((x) => {
                return { name: x, pulse: nextPulse, previous: name };
              })
            );
          } else if (current.type === '&') {
            current.memory[previous] = pulse;
            const allHigh = !Object.values(current.memory).filter(
              (x) => x === 'low'
            ).length;
            let nextPulse = 'high';
            if (allHigh) nextPulse = 'low';

            low += nextPulse === 'low' ? current.next.length : 0;
            high += nextPulse === 'high' ? current.next.length : 0;

            q = q.concat(
              current.next.map((x) => {
                return {
                  name: x,
                  pulse: nextPulse,
                  previous: name,
                };
              })
            );
          }
      }
    }

    cycles--;
  }

  return low * high;
}

function parseInput(data) {
  const modules = new Map();
  modules.set('button', { type: 'button', next: ['broadcaster'] });
  const lines = data.split('\n');
  lines.forEach((line, i) => {
    const [name, nextModules] = line.split(' -> ');
    const key = name === 'broadcaster' ? 'broadcaster' : name.slice(1);
    const module = { type: name[0], next: nextModules.split(', ') };
    if (module.type === '%') module.on = false;
    if (module.type === '&') {
      module.memory = {};
      lines.forEach((l, j) => {
        if (l.includes(key) && i !== j) {
          const connectedName = l.split(' -> ')[0];
          const connectedKey = connectedName.slice(1);
          module.memory[connectedKey] = 'low';
        }
      });
    }
    modules.set(key, module);
  });
  return modules;
}

function getLastModule(data) {
  for (let line of data.split('\n')) {
    const [name, nextModules] = line.split(' -> ');
    if (nextModules.trim() === 'rx') return name.slice(1);
  }
}

function second(data) {
  const modules = parseInput(data);
  const lastModule = getLastModule(data);
  const lastModules = new Set(Object.keys(modules.get(lastModule).memory));
  const lastModulesIntervals = {};
  lastModules.forEach((module) => (lastModulesIntervals[module] = 0));
  let foundCycles = false;
  let buttonPresses = 0;

  while (!foundCycles) {
    let q = [{ name: 'button', pulse: 'low' }];
    buttonPresses++;

    while (q.length) {
      let { name, pulse, previous } = q.shift();
      if (name === lastModule && pulse === 'high') {
        lastModulesIntervals[previous] = buttonPresses;
      }
      if (Object.values(lastModulesIntervals).reduce((acc, a) => acc * a, 1)) {
        foundCycles = true;
        break;
      }
      if (name === 'rx' && pulse === 'low') return buttonPresses;

      let current = modules.get(name);
      if (!current) continue;

      switch (name) {
        case 'button':
          q.push({ name: 'broadcaster', pulse: 'low', previous: name });
          break;
        case 'broadcaster':
          q = q.concat(
            current.next.map((x) => {
              return { name: x, pulse, previous: name };
            })
          );
          break;
        default:
          if (current.type === '%') {
            if (pulse === 'high') break;
            let nextPulse = 'high';
            if (current.on) nextPulse = 'low';
            current.on = !current.on;

            q = q.concat(
              current.next.map((x) => {
                return { name: x, pulse: nextPulse, previous: name };
              })
            );
          } else if (current.type === '&') {
            current.memory[previous] = pulse;
            const allHigh = !Object.values(current.memory).filter(
              (x) => x === 'low'
            ).length;
            let nextPulse = 'high';
            if (allHigh) nextPulse = 'low';

            q = q.concat(
              current.next.map((x) => {
                return {
                  name: x,
                  pulse: nextPulse,
                  previous: name,
                };
              })
            );
          }
      }
    }
  }

  return Object.values(lastModulesIntervals).reduce(leastCommonMultiple);
}

// using Euclidean algorithm
function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function leastCommonMultiple(a, b) {
  return (a * b) / greatestCommonDivisor(a, b);
}

/*
Note - similar to day 8:
LCM could have been used only because the cycle length between the time 
when each last module sends a high pulse is always the same. 
Went with LCM after seeing the cycle lengths.
*/

console.log(first(data));
console.log(second(data));
