export function getSample(arr, k) {
  const sample = [];
  for (let i = 0; i < k; i++) {
    const n = Random.fromLimit(arr.length);
    const [extractedItem] = arr.splice(n, 1);
    sample.push(extractedItem);
  }
  return sample;
}

export class Random {
  static intFromInterval(min, max) {
    /* Min and max are both inclusive */
    return Math.floor(Random.floatFromInterval(min, max)) + 1;
  }

  static floatFromInterval(min, max) {
    return Math.random() * (max - min) + min;
  }

  static fromLimit(limit) {
    /* Limit is non-inclusive */
    return Math.floor(Math.random() * limit);
  }
}
