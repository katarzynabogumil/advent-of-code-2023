'use strict';

const fs = require('fs');

const data = fs.readFileSync('test-data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

const [WORKFLOWS, PARTS] = parseInput(data);
const MIN = 1;
const MAX = 4000;
const INITIAL_MIN = MAX + 1;
const INITIAL_MAX = MIN - 1;

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
  let results = {
    x: 0,
    m: 0,
    a: 0,
    s: 0,
  };
  const edgeConditions = check('in');
  console.log(edgeConditions);

  Object.entries(edgeConditions).forEach(([letter, edgesArr]) => {
    edgesArr.forEach((edges) => {
      if (edges[0] === INITIAL_MIN) edges[0] = MIN;
      if (edges[1] === INITIAL_MAX) edges[1] = MAX;
      results[letter] += edges[1] - edges[0] + 1;
    });
  });
  return results.x * results.m * results.a * results.s;
}

function check(start, edgeConditions) {
  if (!edgeConditions) {
    edgeConditions = {
      x: [[INITIAL_MIN, INITIAL_MAX]],
      m: [[INITIAL_MIN, INITIAL_MAX]],
      a: [[INITIAL_MIN, INITIAL_MAX]],
      s: [[INITIAL_MIN, INITIAL_MAX]],
    };
  }

  if (start === 'A') return edgeConditions;
  if (start === 'R') return;

  const workflow = WORKFLOWS.get(start);
  for (let step of workflow) {
    if (!step.condition) return check(step.next, edgeConditions);
    const letter = step.condition[0];
    const sign = step.condition[1];
    const num = parseInt(step.condition.slice(2));

    const currentNums = edgeConditions[letter];
    const edgeConditionsTrue = { ...edgeConditions };
    const edgeConditionsFalse = { ...edgeConditions };
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    // TODO CHANGE LOGIC TO DIFFERENT RANGES
    switch (sign) {
      case '>':
        const newMin = num + 1;
        if (newMin < currentNums.min) edgeConditionsTrue[letter].min = newMin;
        edgeConditionsFalse[letter].max = num;
        break;
      case '<':
        const newMax = num - 1;
        if (newMax > currentNums.max) edgeConditionsTrue[letter].max = newMax;
        edgeConditionsFalse[letter].min = num;
        break;
    }

    const conditionTrue = check(step.next, edgeConditionsTrue);
    const conditionFalse = check(step.next, edgeConditionsFalse);
    if (!conditionTrue) return conditionFalse;
    if (!conditionFalse) return conditionTrue;
    return mergeConditions(conditionTrue, conditionFalse);
  }
}

function mergeConditions(conditionTrue, conditionFalse) {
  const mergedEdgeConditions = {};
  Object.entries(conditionTrue).forEach(([letter, arrTrue]) => {
    const arrFalse = conditionFalse[letter];
    const newArr = [];
    // combine ranges
    let [start1, end1] = arrFalse.shift();
    let [start2, end2] = arrTrue.shift();
    let start = true;
    while (start || (arrFalse.length && arrTrue.length)) {
      start = false;
      if (start2 > end1 + 1) {
        newArr.push([start1, end1]);
        [start1, end1] = arrFalse.shift();
      } else if (start1 > end2 + 1) {
        newArr.push([start2, end2]);
        [start2, end2] = arrTrue.shift();
      } else if (start2 <= end1 + 1 && start2 >= start1) {
        newArr.push([start1, end2]);
        [start2, end2] = arrTrue.shift();
        [start1, end1] = arrFalse.shift();
      } else if (start1 <= end2 + 1 && start1 >= start2) {
        newArr.push([start2, end1]);
        [start2, end2] = arrTrue.shift();
        [start1, end1] = arrFalse.shift();
      }
    }
    // if something left in one of the arrays
    newArr.concat([...arrFalse, ...arrTrue]);
    mergedEdgeConditions[letter] = newArr;
  });
  return mergedEdgeConditions;
}

// console.log(first());
// console.log(second());
console.log(
  mergeConditions(
    {
      m: [
        [1, 2],
        [3, 4],
        [10, 14],
      ],
    },
    {
      m: [
        [12, 16],
        [17, 18],
      ],
    }
  )
);
