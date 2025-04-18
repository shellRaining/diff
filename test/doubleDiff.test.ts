import { describe, it, expect } from "vitest";
import { doubleDiff } from "../src/doubleDiff";
import type { ElementType, NodeOperations } from "../src/nodeOps";

// Create custom mock nodeOps for testing
function createMocknodeOps<T extends ElementType>(): NodeOperations<T> & {
  operations: string[];
} {
  const operations: string[] = [];

  return {
    operations,
    moveElement(array, fromIndex, toIndex) {
      const result = [...array];
      const [element] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, element);
      operations.push(`move:${fromIndex}:${toIndex}`);
      return result;
    },
    addElement(array, element, index) {
      const result = [...array];
      result.splice(index, 0, element);
      operations.push(`add:${String(element)}:${index}`);
      return result;
    },
    removeElement(array, index) {
      const result = [...array];
      result.splice(index, 1);
      operations.push(`remove:${index}`);
      return result;
    },
    findElementIndex(array, element) {
      return array.findIndex((item) => item === element);
    },
  };
}

describe("doubleDiff", () => {
  describe("with primitive types", () => {
    it("should handle identical arrays", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states).toHaveLength(1);
      expect(states[0]).toEqual(oldNodes);
      expect(mockOps.operations).toHaveLength(0);
    });

    it("should handle additions at the beginning", () => {
      const oldNodes = [2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:1:0");
    });

    it("should handle additions at the end", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:4:3");
    });

    it("should handle additions in the middle", () => {
      const oldNodes = [1, 2, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:3:2");
    });

    it("should handle removals from the beginning", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("remove:0");
    });

    it("should handle removals from the end", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("remove:3");
    });

    it("should handle removals from the middle", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("remove:2");
    });

    it("should handle simple moves", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 3, 2, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      // Expect a move operation happened
      expect(mockOps.operations.some((op) => op.startsWith("move:"))).toBe(
        true,
      );
    });

    it("should handle with abnormal situation properly", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [2, 4, 1, 3];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
    });

    it("should handle prefix and suffix nodes correctly", () => {
      const oldNodes = [1, 2, 3, 4, 5, 6];
      const newNodes = [1, 2, 4, 3, 5, 6];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      // one move operation should happen, not modifying the common prefix/suffix
      expect(mockOps.operations.length).toBe(1);
    });

    it("should efficiently handle reversed arrays", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [5, 4, 3, 2, 1];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      // Check that move operations were performed
      expect(
        mockOps.operations.filter((op) => op.startsWith("move:")).length,
      ).toBeGreaterThan(0);
    });

    it("should handle complex transformations", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [6, 2, 7, 5, 3];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      // Check for expected operations (additions, removals, moves)
      const operations = mockOps.operations;
      expect(
        operations.filter((op) => op.startsWith("add:")).length,
      ).toBeGreaterThan(0);
      expect(
        operations.filter((op) => op.startsWith("remove:")).length,
      ).toBeGreaterThan(0);
    });

    it("should optimize operations by reusing common prefix/suffix", () => {
      const oldNodes = [1, 2, 3, 4, 5, 6, 7, 8];
      const newNodes = [1, 2, 8, 3, 4, 6, 7];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
    });
  });

  describe("with string types", () => {
    it("should handle string arrays", () => {
      const oldNodes = ["a", "b", "c"];
      const newNodes = ["d", "a", "c", "e"];
      const mockOps = createMocknodeOps<string>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(
        mockOps.operations.filter((op) => op.startsWith("add:")).length,
      ).toBeGreaterThan(0);
      expect(
        mockOps.operations.filter((op) => op.startsWith("remove:")).length,
      ).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty old array", () => {
      const oldNodes: number[] = [];
      const newNodes = [1, 2, 3];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations.length).toBe(3); // Three add operations
    });

    it("should handle empty new array", () => {
      const oldNodes = [1, 2, 3];
      const newNodes: number[] = [];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations.length).toBe(3); // Three remove operations
    });

    it("should handle completely different arrays", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [4, 5, 6];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(
        mockOps.operations.filter((op) => op.startsWith("add:")).length,
      ).toBe(3);
      expect(
        mockOps.operations.filter((op) => op.startsWith("remove:")).length,
      ).toBe(3);
    });

    it("should perform efficiently when one array is a subset of the other", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations.length).toBe(5);
    });

    it("should handle arrays with repeated elements", () => {
      const oldNodes = [1, 2, 2, 3, 4];
      const newNodes = [1, 2, 3, 2, 4];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      // Test that the repeated element is handled correctly
      expect(mockOps.operations.some((op) => op.startsWith("move:"))).toBe(
        true,
      );
    });
  });

  describe("performance optimizations", () => {
    it("should minimize the number of operations", () => {
      const oldNodes = [1, 2, 3, 4, 5, 6, 7, 8];
      const newNodes = [8, 7, 6, 5, 4, 3, 2, 1];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // A naive algorithm might perform 16+ operations (remove all + add all)
      // An optimal solution would use fewer operations
      expect(mockOps.operations.length).toBeLessThan(16);
    });

    it("should prefer moving elements over remove+add when possible", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [4, 3, 2, 1];
      const mockOps = createMocknodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Should prefer moves over removes+adds
      expect(
        mockOps.operations.filter((op) => op.startsWith("move:")).length,
      ).toBeGreaterThan(0);

      // Should have fewer operations than naive remove+add (which would be 8 operations)
      expect(mockOps.operations.length).toBeLessThan(8);
    });
  });
});
