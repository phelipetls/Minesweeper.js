function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getSample(arr, k) {
  const sample = [];
  for (let i = 0; i < k; i++) {
    const n = getRandomNumber(arr.length);
    const [extractedItem] = arr.splice(n, 1);
    sample.push(extractedItem);
  }
  return sample;
}
