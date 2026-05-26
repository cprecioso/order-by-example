export interface Sort<T> {
  /**
   * Compares two items and returns -1, 0, or 1.
   * Can be used as a compare function for {@link Array.prototype.sort}.
   *
   * @example
   * const sort = makeSort([['apple', 'banana'], ['banana', 'cherry']]);
   *
   * // Use directly if needed:
   * sort.compare('apple', 'banana');
   *
   * // But usually, you would use it with Array.prototype.sort:
   * const items = ['banana', 'cherry', 'apple'];
   * items.sort(sort.compare); // ['apple', 'banana', 'cherry']
   */
  compare(a: T, b: T): 0 | 1 | -1;

  /**
   * Returns a sorted array of all items that were used in the examples.
   */
  sortedExamples(): T[];
}

/**
 * Creates a {@link Sort} instance based on the provided examples.
 * Each example is an iterable of items, and the order of items in the example defines their relative order.
 *
 * The compare function looks for the first example in which both items appear. If found, it returns
 * -1, 1, or 0 based on their indices in that example. If no single example contains both items, it
 * returns 0. Ordering is not bridged transitively across examples.
 *
 * @example
 * const sort = makeSort([
 *   ['apple', 'banana', 'cherry'],
 *   ['banana', 'date'],
 * ]);
 *
 * console.log(sort.compare('apple', 'banana')); // -1
 * console.log(sort.compare('banana', 'apple')); // 1
 * console.log(sort.compare('banana', 'cherry')); // -1
 * console.log(sort.compare('cherry', 'banana')); // 1
 * console.log(sort.compare('banana', 'date')); // -1
 * console.log(sort.compare('apple', 'date')); // 0 (no single example contains both)
 * console.log(sort.compare('date', 'cherry')); // 0 (no single example contains both)
 *
 * // sortedExamples() flattens all example items in sorted order. Items that appear in multiple
 * // examples are included once per example.
 * console.log(sort.sortedExamples()); // ['apple', 'banana', 'banana', 'cherry', 'date']
 *
 * console.log(['banana', 'cherry', 'apple'].sort(sort.compare)); // ['apple', 'banana', 'cherry']
 */
export const makeSort = <T>(examples: Iterable<Iterable<T>>): Sort<T> => {
  const exampleMaps = Array.from(
    examples,
    (example) => new Map(Array.from(example, (item, idx) => [item, idx])),
  );

  let sortedExamplesCache: readonly T[];

  return {
    compare(a: T, b: T): -1 | 0 | 1 {
      for (const example of exampleMaps) {
        const aIdx = example.get(a);
        if (aIdx === undefined) continue;

        const bIdx = example.get(b);
        if (bIdx === undefined) continue;

        return aIdx < bIdx ? -1 : aIdx > bIdx ? 1 : 0;
      }

      return 0;
    },

    sortedExamples(): T[] {
      if (!sortedExamplesCache) {
        sortedExamplesCache = exampleMaps
          .flatMap((example) => Array.from(example.keys()))
          .sort(this.compare);
      }

      return Array.from(sortedExamplesCache);
    },
  };
};
