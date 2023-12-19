'use strict';

const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

const [WORKFLOWS, PARTS] = parseInput(data);

function parseInput(data) {
  const workflowMap = new Map();
  const parts = [];
  const lines = data.split('\n');
  let partsFlag = false;
  for (let line of lines) {
    if (partsFlag) {
      const nums = line.replace(/[{}xmas=]/g, '').split(',');
      parts.push({
        x: parseInt(nums[0]),
        m: parseInt(nums[1]),
        a: parseInt(nums[2]),
        s: parseInt(nums[3]),
      });
    } else if (!line.trim().length) partsFlag = true;
    else {
      const rules = line.replace('}', '').split(/[{,]/g);
      workflowMap.set(
        rules[0],
        rules.slice(1).map((el) => {
          const elArr = el.split(':');
          if (elArr.length === 1) return { next: elArr[0] };
          return { condition: elArr[0], next: elArr[1] };
        })
      );
    }
  }
  return [workflowMap, parts];
}

function first() {
  let sum = 0;
  PARTS.forEach((part) => {
    if (checkPart(part, 'in')) sum += part.x + part.m + part.a + part.s;
  });
  return sum;
}

function checkPart(part, start) {
  if (start === 'A') return true;
  if (start === 'R') return false;

  const x = part.x;
  const m = part.m;
  const a = part.a;
  const s = part.s;

  const workflow = WORKFLOWS.get(start);
  for (let step of workflow) {
    if (!step.condition) return checkPart(part, step.next);
    const condition = eval(step.condition);
    if (condition) return checkPart(part, step.next);
  }
}

function second() {
  const min = 1;
  const max = 4000;
  const initialMin = min - 1;
  const initialMax = max + 1;

  const edges = {
    min: initialMin,
    max: initialMax,
  };

  const initialConditions = {
    x: edges,
    m: { ...edges },
    a: { ...edges },
    s: { ...edges },
  };

  const edgeConditionsArr = check('in', initialConditions, []);
  const noOverlapArr = [];
  let counter = 1;

  while (edgeConditionsArr.length) {
    counter++;
    const conditions1 = edgeConditionsArr.shift();
    Object.values(conditions1).forEach((edges) => {
      if (edges.min === initialMin) edges.min = min;
      if (edges.max === initialMax) edges.max = max;
    });

    let overlap = false;
    noOverlapArr.forEach((conditions2) => {
      let overlapObj = { x: false, m: false, a: false, s: false };

      Object.entries(conditions2).forEach(([letter, edges2]) => {
        const edges1 = conditions1[letter];
        if (
          (edges1.min <= edges2.max && edges1.min >= edges2.min) ||
          (edges2.min <= edges1.max && edges2.min >= edges1.min)
        ) {
          overlapObj[letter] = true;
        }
      });

      if (Object.values(overlapObj).filter((v) => v).length === 4) {
        overlap = true;

        ['x', 'm', 'a', 's'].forEach((letter) => {
          const edges1 = conditions1[letter];
          const edges2 = conditions2[letter];

          let noOverlapMin = 0;
          let noOverlapMax = 0;
          if (
            edges1.min <= edges2.max &&
            edges1.min >= edges2.min &&
            edges1.max > edges2.max
          ) {
            noOverlapMin = edges2.max + 1;
            noOverlapMax = edges1.max;
          } else if (edges2.min <= edges1.max && edges2.min > edges1.min) {
            noOverlapMin = edges1.min;
            noOverlapMax = edges2.min - 1;
          }

          if (noOverlapMin && noOverlapMax && noOverlapMax >= noOverlapMin) {
            const range = { ...conditions2 };
            range[letter] = { min: noOverlapMin, max: noOverlapMax };
            edgeConditionsArr.push(range);
          }
        });
      }
    });
    if (!overlap) noOverlapArr.push(conditions1);
  }

  let results = 0;
  noOverlapArr.forEach((edgeConditions) => {
    let conditions = {};
    Object.entries(edgeConditions).forEach(([letter, edges]) => {
      conditions[letter] = edges.max - edges.min + 1;
    });
    results += conditions.x * conditions.m * conditions.a * conditions.s;
  });

  return results;
}

function check(start, edgeConditions, results) {
  if (start === 'A') {
    return [...results, edgeConditions];
  }
  if (start === 'R') return results;

  const workflow = WORKFLOWS.get(start);
  for (let step of workflow) {
    if (!step.condition) return check(step.next, edgeConditions, results);
    const letter = step.condition[0];
    const sign = step.condition[1];
    const num = parseInt(step.condition.slice(2));
    const currentNums = edgeConditions[letter];
    const edgeConditionsTrue = JSON.parse(JSON.stringify(edgeConditions));

    switch (sign) {
      case '>':
        const newMin = num + 1;
        if (newMin > currentNums.min) edgeConditionsTrue[letter].min = newMin;
        edgeConditions[letter].max = num;
        break;
      case '<':
        const newMax = num - 1;
        if (newMax < currentNums.max) edgeConditionsTrue[letter].max = newMax;
        edgeConditions[letter].min = num;
        break;
    }

    if (edgeConditionsTrue[letter].min <= edgeConditionsTrue[letter].max)
      results = check(step.next, edgeConditionsTrue, results);
    if (edgeConditions[letter].min > edgeConditions[letter].max) return results;
  }
}

console.log(first());
console.log(second());
