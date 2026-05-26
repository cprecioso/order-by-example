import { describe, expect, it } from "vitest";
import { makeSort } from ".";

describe("makeSort", () => {
  describe("compare", () => {
    it("returns -1 when the first item comes before the second in an example", () => {
      const sort = makeSort([["apple", "banana", "cherry"]]);
      expect(sort.compare("apple", "banana")).toBe(-1);
      expect(sort.compare("apple", "cherry")).toBe(-1);
      expect(sort.compare("banana", "cherry")).toBe(-1);
    });

    it("returns 1 when the first item comes after the second in an example", () => {
      const sort = makeSort([["apple", "banana", "cherry"]]);
      expect(sort.compare("banana", "apple")).toBe(1);
      expect(sort.compare("cherry", "apple")).toBe(1);
      expect(sort.compare("cherry", "banana")).toBe(1);
    });

    it("returns 0 when comparing an item to itself", () => {
      const sort = makeSort([["apple", "banana"]]);
      expect(sort.compare("apple", "apple")).toBe(0);
    });

    it("returns 0 when neither item appears in any example", () => {
      const sort = makeSort([["apple", "banana"]]);
      expect(sort.compare("cherry", "date")).toBe(0);
    });

    it("returns 0 when only one of the items appears in any example", () => {
      const sort = makeSort([["apple", "banana"]]);
      expect(sort.compare("apple", "cherry")).toBe(0);
      expect(sort.compare("cherry", "apple")).toBe(0);
    });

    it("returns 0 when items appear in different examples but never together", () => {
      const sort = makeSort([
        ["apple", "banana"],
        ["cherry", "date"],
      ]);
      expect(sort.compare("apple", "cherry")).toBe(0);
      expect(sort.compare("banana", "date")).toBe(0);
      expect(sort.compare("date", "apple")).toBe(0);
    });

    it("uses the first example where both items appear", () => {
      const sort = makeSort([
        ["apple", "banana"],
        ["banana", "date"],
      ]);
      expect(sort.compare("apple", "date")).toBe(0);
      expect(sort.compare("apple", "banana")).toBe(-1);
      expect(sort.compare("banana", "date")).toBe(-1);
    });

    it("does not bridge ordering transitively across examples", () => {
      const sort = makeSort([
        ["apple", "banana", "cherry"],
        ["banana", "date"],
      ]);
      expect(sort.compare("apple", "banana")).toBe(-1);
      expect(sort.compare("banana", "apple")).toBe(1);
      expect(sort.compare("banana", "cherry")).toBe(-1);
      expect(sort.compare("cherry", "banana")).toBe(1);
      expect(sort.compare("apple", "date")).toBe(0);
      expect(sort.compare("date", "apple")).toBe(0);
      expect(sort.compare("date", "cherry")).toBe(0);
    });

    it("works with non-string item types", () => {
      const sort = makeSort([
        [1, 2, 3],
        [3, 4, 5],
      ]);
      expect(sort.compare(1, 2)).toBe(-1);
      expect(sort.compare(5, 3)).toBe(1);
      expect(sort.compare(1, 4)).toBe(0);
    });

    it("handles an empty list of examples", () => {
      const sort = makeSort([]);
      expect(sort.compare("apple", "banana")).toBe(0);
    });

    it("handles examples with a single item", () => {
      const sort = makeSort([["apple"]]);
      expect(sort.compare("apple", "apple")).toBe(0);
      expect(sort.compare("apple", "banana")).toBe(0);
    });

    it("accepts arbitrary iterables for examples", () => {
      function* outer() {
        yield new Set(["apple", "banana"]);
        yield new Set(["banana", "cherry"]);
      }
      const sort = makeSort(outer());
      expect(sort.compare("apple", "banana")).toBe(-1);
      expect(sort.compare("cherry", "banana")).toBe(1);
    });
  });

  describe("sortedExamples", () => {
    it("returns a sorted array of all items from a single example", () => {
      const sort = makeSort([["cherry", "apple", "banana"]]);
      expect(sort.sortedExamples()).toEqual(["cherry", "apple", "banana"]);
    });

    it("returns an empty array when there are no examples", () => {
      const sort = makeSort<string>([]);
      expect(sort.sortedExamples()).toEqual([]);
    });

    it("includes duplicates when items appear in multiple examples", () => {
      const sort = makeSort([
        ["apple", "banana"],
        ["banana", "cherry"],
      ]);
      const result = sort.sortedExamples();
      expect(result).toHaveLength(4);
      expect(result.filter((x) => x === "banana")).toHaveLength(2);
    });

    it("returns a fresh array on each call so mutations do not leak", () => {
      const sort = makeSort([["apple", "banana"]]);
      const first = sort.sortedExamples();
      first.push("cherry");
      expect(sort.sortedExamples()).toEqual(["apple", "banana"]);
    });
  });
});
