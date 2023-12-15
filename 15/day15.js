const fs = require('fs');

const data = fs.readFileSync('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  return data;
});

function first(data) {
  let sum = 0;
  const elements = data.trim().split(',');
  elements.forEach((el) => {
    let current = hash(el);
    sum += current;
  });
  return sum;
}

const hash = memoize((el, current = 0) => {
  if (!el.length) return current;
  let char = el[0];
  current += char.charCodeAt();
  current = (current * 17) % 256;
  return hash(el.slice(1), current);
});

function memoize(func) {
  let cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, func(...args));
    return cache.get(key);
  };
}

function second(data) {
  const hashMap = new Map();

  const elements = data.trim().split(',');
  elements.forEach((el, i) => {
    let [key, value] = el.split(/=|-/);
    const hashKey = hash(key);
    if (hashMap.get(hashKey) === undefined) hashMap.set(hashKey, new List());
    if (value !== '') hashMap.get(hashKey).add({ key, value });
    else hashMap.get(hashKey).remove(key);
  });

  let sum = 0;
  const iterator = hashMap.entries();
  let i = 0;
  while (i < hashMap.size) {
    const [box, list] = iterator.next().value;
    sum += (parseInt(box) + 1) * list.getPower();
    i++;
  }
  return sum;
}

class Node {
  constructor({ key, value }) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

class List {
  constructor() {
    this.head = null;
  }

  add({ key, value }) {
    const node = new Node({ key, value });
    if (!this.head) {
      this.head = node;
      return;
    }

    let current = this.head;
    let previous = null;

    while (current) {
      if (current.key === key) {
        current.value = value;
        return;
      }
      previous = current;
      current = current.next;
    }

    previous.next = node;
  }

  remove(key) {
    if (!this.head) return;

    let current = this.head;
    let previous = null;
    while (current && current.key !== key) {
      previous = current;
      current = current.next;
    }

    if (!current) return;
    if (!previous) this.head = current.next;
    else previous.next = current.next;
  }

  getPower() {
    if (!this.head) return 0;
    let sum = 0;
    let current = this.head;
    let slot = 1;
    while (current) {
      sum += current.value * slot;
      current = current.next;
      slot++;
    }
    return sum;
  }
}

console.log(first(data));
console.log(second(data));
