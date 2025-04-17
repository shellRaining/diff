import { describe, it, expect, vi, beforeEach } from "vitest";
import { diff } from "../src/simpleDiff";
import type { ElementType, NodeOperations } from "../src/nodeOps";
import { nodeOps } from "../src/nodeOps";

// Mock console.log to avoid output during tests
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

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

describe("nodeOps", () => {
  describe("moveElement", () => {
    it("should move element from one index to another", () => {
      const array = [1, 2, 3, 4, 5];
      const result = nodeOps.moveElement(array, 1, 3);
      expect(result).toEqual([1, 3, 4, 2, 5]);
    });
  });

  describe("addElement", () => {
    it("should add element at specified index", () => {
      const array = [1, 2, 4, 5];
      const result = nodeOps.addElement(array, 3, 2);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("removeElement", () => {
    it("should remove element at specified index", () => {
      const array = [1, 2, 3, 4, 5];
      const result = nodeOps.removeElement(array, 2);
      expect(result).toEqual([1, 2, 4, 5]);
    });
  });

  describe("findElementIndex", () => {
    it("should find the index of an element", () => {
      const array = [1, 2, 3, 4, 5];
      expect(nodeOps.findElementIndex(array, 3)).toBe(2);
      expect(nodeOps.findElementIndex(array, 6)).toBe(-1);
    });
  });
});

describe("diff", () => {
  describe("with primitive types", () => {
    it("should handle identical arrays", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states).toHaveLength(1);
      expect(states[0]).toEqual(oldNodes);
      expect(mockOps.operations).toHaveLength(0);
    });

    it("should handle additions at the beginning", () => {
      const oldNodes = [2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:1:0");
    });

    it("should handle additions at the end", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:4:3");
    });

    it("should handle additions in the middle", () => {
      const oldNodes = [1, 2, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("add:3:2");
    });

    it("should handle removals", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations).toContainEqual("remove:2");
    });

    it("should handle moves", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 3, 2, 4];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      // Check that a move operation occurred
      expect(mockOps.operations.some((op) => op.startsWith("move:"))).toBe(
        true,
      );
    });

    it("should handle complex transformations", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [6, 2, 7, 5, 3];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

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
  });

  describe("with string types", () => {
    it("should handle string arrays", () => {
      const oldNodes = ["a", "b", "c"];
      const newNodes = ["d", "a", "c", "e"];
      const mockOps = createMocknodeOps<string>();

      const states = diff(oldNodes, newNodes, mockOps);

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

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations.length).toBe(3); // Three add operations
    });

    it("should handle empty new array", () => {
      const oldNodes = [1, 2, 3];
      const newNodes: number[] = [];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(mockOps.operations.length).toBe(3); // Three remove operations
    });

    it("should handle completely different arrays", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [4, 5, 6];
      const mockOps = createMocknodeOps<number>();

      const states = diff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
      expect(
        mockOps.operations.filter((op) => op.startsWith("add:")).length,
      ).toBe(3);
      expect(
        mockOps.operations.filter((op) => op.startsWith("remove:")).length,
      ).toBe(3);
    });
  });
});
