'use strict';

const fs = require('fs');

const data = fs.readFileSync('test-data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  const { blocks, setPoints } = getSetBlocks(data);
  const blocksToDesintegrate = new Map();
  blocks.forEach((block, i) => {
    if (i === blocks.length - 1) {
      blocksToDesintegrate.set(strBlock(block), i);
      return;
    }
    const blocksAbove = getUnsupportedAbove(block, setPoints);
    if (!blocksAbove.size) blocksToDesintegrate.set(strBlock(block), i);
  });

  return blocksToDesintegrate;
}

function getUnsupportedAbove(block, setPoints) {
  const blockStr = strBlock(block);
  const blocksAbove = new Map();

  // does the block has something above?
  for (let point of block) {
    const pointAbove = [point[0], point[1], point[2] + 1];
    if (!setPoints.has(str(pointAbove))) continue;
    const blockAbove = setPoints.get(str(pointAbove));
    const blockAboveAtr = strBlock(blockAbove);
    if (blockAboveAtr === blockStr) continue;
    blocksAbove.set(blockAboveAtr, true);
  }

  if (!blocksAbove.size) return new Map();

  // check if under that block is some other point, not within this block
  for (const [blockAbove, _] of blocksAbove) {
    let otherBlockBelowFLag = false;
    const blockAbovePoints = unStrBlock(blockAbove);
    for (let point of blockAbovePoints) {
      const pointBelow = [point[0], point[1], point[2] - 1];
      if (!setPoints.has(str(pointBelow))) continue;
      const otherBlockBelow = strBlock(setPoints.get(str(pointBelow)));
      if (otherBlockBelow === strBlock(block)) continue;
      if (otherBlockBelow === blockAbove) continue;
      otherBlockBelowFLag = true;
      blocksAbove.delete(blockAbove);
      break;
    }
    if (otherBlockBelowFLag) blocksAbove.delete(blockAbove);
  }

  return blocksAbove;
}

function getSetBlocks(data) {
  const lines = parseInput(data);
  const setPoints = new Map();
  let blocks = [];

  lines.forEach((line) => {
    let block = getPoints(line);
    let floating = true;
    let start = true;

    while (floating) {
      if (!start) block = block.map((p) => [p[0], p[1], p[2] - 1]);
      for (let point of block) {
        const pointBelow = [point[0], point[1], point[2] - 1];
        if (!setPoints.has(str(pointBelow)) && point[2] !== 1) continue;
        floating = false;
        break;
      }
      start = false;
    }

    block.forEach((point) => setPoints.set(str(point), block));
    blocks.push(block);
  });

  return { blocks, setPoints };
}

function getPoints(line) {
  const [start, end] = line;
  if (str(start) === str(end)) return [start];
  if (start[0] !== end[0])
    return [start, ...getPoints([[start[0] + 1, start[1], start[2]], end])];
  if (start[1] !== end[1])
    return [start, ...getPoints([[start[0], start[1] + 1, start[2]], end])];
  if (start[2] !== end[2])
    return [start, ...getPoints([[start[0], start[1], start[2] + 1], end])];
}

function parseInput(data) {
  return data
    .split('\n')
    .map((x) => x.split('~').map((y) => y.split(',').map((z) => parseInt(z))))
    .sort((a, b) => {
      if (a[0][2] < b[0][2]) return -1;
      if (a[0][2] > b[0][2]) return 1;
      if (a[1][2] < b[1][2]) return -1;
      return 1;
    });
}

function str(point) {
  return point.join(',');
}

function strBlock(block) {
  return block.map((x) => x.join(',')).join('-');
}

function unStrBlock(block) {
  return block.split('-').map((x) => x.split(',').map((y) => parseInt(y)));
}

function second(data) {}

console.log(first(data).size);
console.log(second(data));
