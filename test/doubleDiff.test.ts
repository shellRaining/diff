import { describe, it, expect } from "vitest";
import { doubleDiff } from "../src/doubleDiff";
import { createMockNodeOps, operationUtils } from "./utils/testUtils";

describe("doubleDiff algorithm", () => {
  describe("Basic cases", () => {
    it("should handle identical arrays without changes", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states).toHaveLength(1);
      expect(states[0]).toEqual(oldNodes);
      expect(mockOps.operations).toHaveLength(0);
    });

    it("should handle empty arrays", () => {
      const emptyArray: number[] = [];

      // Empty old array to non-empty new array
      const mockOps1 = createMockNodeOps<number>();
      const states1 = doubleDiff(emptyArray, [1, 2, 3], mockOps1);
      expect(states1[states1.length - 1]).toEqual([1, 2, 3]);
      expect(mockOps1.operations).toHaveLength(3);
      expect(operationUtils.countByType(mockOps1.operations).adds).toBe(3);

      // Non-empty old array to empty new array
      const mockOps2 = createMockNodeOps<number>();
      const states2 = doubleDiff([1, 2, 3], emptyArray, mockOps2);
      expect(states2[states2.length - 1]).toEqual([]);
      expect(mockOps2.operations).toHaveLength(3);
      expect(operationUtils.countByType(mockOps2.operations).removes).toBe(3);

      // Both empty arrays
      const mockOps3 = createMockNodeOps<number>();
      const states3 = doubleDiff(emptyArray, emptyArray, mockOps3);
      expect(states3).toHaveLength(1);
      expect(states3[0]).toEqual([]);
      expect(mockOps3.operations).toHaveLength(0);
    });
  });

  describe("Five comparison scenarios", () => {
    // Test for each of the five comparison scenarios in double-ended diff

    describe("1. Head to Head comparison", () => {
      it("should efficiently handle matching start elements", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [1, 6, 7, 8, 9];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // The first element should be preserved without moves
        const moveOps = operationUtils.getByType(mockOps.operations, "move");
        expect(moveOps.every((op) => op.element !== 1)).toBe(true);

        // Should not perform unnecessary operations on common prefix
        expect(mockOps.operations.length).toBeLessThan(
          oldNodes.length + newNodes.length,
        );
      });

      it("should preserve common prefix elements", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [1, 2, 6, 7, 8];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Elements 1 and 2 should be preserved
        const allOps = mockOps.operations;
        expect(
          allOps.every(
            (op) =>
              !(op.type === "move" && (op.element === 1 || op.element === 2)) &&
              !(op.type === "remove" && (op.element === 1 || op.element === 2)),
          ),
        ).toBe(true);
      });
    });

    describe("2. Tail to Tail comparison", () => {
      it("should efficiently handle matching end elements", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [6, 7, 8, 9, 5];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // The last element should be preserved without moves
        const moveOps = operationUtils.getByType(mockOps.operations, "move");
        expect(moveOps.every((op) => op.element !== 5)).toBe(true);
      });

      it("should preserve common suffix elements", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [6, 7, 8, 4, 5];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Elements 4 and 5 should be preserved
        const allOps = mockOps.operations;
        expect(
          allOps.every(
            (op) =>
              !(op.type === "move" && (op.element === 4 || op.element === 5)) &&
              !(op.type === "remove" && (op.element === 4 || op.element === 5)),
          ),
        ).toBe(true);
      });
    });

    describe("3. Head to Tail comparison", () => {
      it("should handle when old start matches new end", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [2, 3, 4, 5, 1];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should include a move operation for element 1
        const moveOps = operationUtils.getByType(mockOps.operations, "move");
        expect(moveOps.some((op) => op.element === 1)).toBe(true);

        // Check if element 1 was moved to the end
        const elementMove = moveOps.find((op) => op.element === 1);
        expect(elementMove?.toIndex).toBeGreaterThan(3); // Moved to later position
      });

      it("should optimize operations when moving head to tail", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [2, 3, 1, 4, 5];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should prefer moving over remove+add
        expect(
          operationUtils.countByType(mockOps.operations).moves,
        ).toBeGreaterThan(0);
        expect(operationUtils.countByType(mockOps.operations).adds).toBe(0);
        expect(operationUtils.countByType(mockOps.operations).removes).toBe(0);
      });
    });

    describe("4. Tail to Head comparison", () => {
      it("should handle when old end matches new start", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [5, 1, 2, 3, 4];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should include a move operation for element 5
        const moveOps = operationUtils.getByType(mockOps.operations, "move");
        expect(moveOps.some((op) => op.element === 5)).toBe(true);

        // Check if element 5 was moved to the beginning
        const elementMove = moveOps.find((op) => op.element === 5);
        expect(elementMove?.toIndex).toBeLessThan(2); // Moved to earlier position
      });

      it("should optimize operations when moving tail to head", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [5, 1, 2, 3, 4];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should prefer moving over remove+add
        expect(
          operationUtils.countByType(mockOps.operations).moves,
        ).toBeGreaterThan(0);
        expect(operationUtils.countByType(mockOps.operations).adds).toBe(0);
        expect(operationUtils.countByType(mockOps.operations).removes).toBe(0);
      });
    });

    describe("5. Search and compare (non-matching cases)", () => {
      it("should handle finding and moving non-sequential elements", () => {
        const oldNodes = [1, 2, 3, 4, 5];
        const newNodes = [1, 5, 2, 3, 4];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should include a move operation for element 5
        const moveOps = operationUtils.getByType(mockOps.operations, "move");
        expect(moveOps.some((op) => op.element === 5)).toBe(true);
      });

      it("should handle adding new elements when no match is found", () => {
        const oldNodes = [1, 2, 3, 4];
        const newNodes = [1, 5, 2, 3, 4];
        const mockOps = createMockNodeOps<number>();

        const states = doubleDiff(oldNodes, newNodes, mockOps);

        expect(states[states.length - 1]).toEqual(newNodes);

        // Should include an add operation for element 5
        const addOps = operationUtils.getByType(mockOps.operations, "add");
        expect(addOps.some((op) => op.element === 5)).toBe(true);
      });
    });
  });

  describe("Complex transformations", () => {
    it("should efficiently handle reversed arrays", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [5, 4, 3, 2, 1];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Compare with naive solution (remove all + add all would be 10 operations)
      expect(mockOps.operations.length).toBeLessThan(10);

      // Should prefer moves over removes+adds
      expect(
        operationUtils.countByType(mockOps.operations).moves,
      ).toBeGreaterThan(0);
    });

    it("should handle mixed operations (adds, removes, and moves)", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [5, 6, 3, 7, 1];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      const counts = operationUtils.countByType(mockOps.operations);

      // Should include all three operation types
      expect(counts.moves).toBeGreaterThan(0);
      expect(counts.adds).toBeGreaterThan(0);
      expect(counts.removes).toBeGreaterThan(0);
    });

    it("should handle arrays with repeated elements", () => {
      const oldNodes = [1, 2, 2, 3, 4];
      const newNodes = [1, 2, 3, 2, 4];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Check that repeated elements are handled correctly
      expect(mockOps.operations.some((op) => op.type === "move")).toBe(true);
    });

    it("should correctly handle complex reorderings with minimal operations", () => {
      const oldNodes = [1, 2, 3, 4, 5, 6, 7, 8];
      const newNodes = [8, 3, 4, 2, 7, 1, 6, 5];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Should use fewer operations than naive approach (16 operations for remove all + add all)
      expect(mockOps.operations.length).toBeLessThan(16);
    });
  });

  describe("Edge cases", () => {
    it("should handle completely different arrays", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [4, 5, 6];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      const counts = operationUtils.countByType(mockOps.operations);
      expect(counts.adds).toBe(3);
      expect(counts.removes).toBe(3);
    });

    it("should handle when one array is a subset of the other", () => {
      // Old array is a subset of new array
      const mockOps1 = createMockNodeOps<number>();
      const states1 = doubleDiff([1, 2, 3], [1, 2, 3, 4, 5], mockOps1);
      expect(states1[states1.length - 1]).toEqual([1, 2, 3, 4, 5]);
      expect(operationUtils.countByType(mockOps1.operations).adds).toBe(2);
      expect(operationUtils.countByType(mockOps1.operations).removes).toBe(0);

      // New array is a subset of old array
      const mockOps2 = createMockNodeOps<number>();
      const states2 = doubleDiff([1, 2, 3, 4, 5], [1, 2, 3], mockOps2);
      expect(states2[states2.length - 1]).toEqual([1, 2, 3]);
      expect(operationUtils.countByType(mockOps2.operations).adds).toBe(0);
      expect(operationUtils.countByType(mockOps2.operations).removes).toBe(2);
    });

    it("should handle arrays with null elements", () => {
      const oldNodes = [1, null as unknown as number, 3, 4];
      const newNodes = [1, 2, 3, null as unknown as number];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);
    });

    it("should handle edge case with repeated elements in complex arrangement", () => {
      const oldNodes = [1, 2, 3, 2, 4, 5];
      const newNodes = [2, 6, 4, 2, 3, 1];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);
    });
  });

  describe("Performance optimization", () => {
    it("should minimize the number of operations", () => {
      const oldNodes = Array.from({ length: 10 }, (_, i) => i + 1);
      const newNodes = Array.from({ length: 10 }, (_, i) => 10 - i);
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // A naive algorithm might perform 20 operations (remove all + add all)
      // Double-ended diff should perform significantly fewer
      expect(mockOps.operations.length).toBeLessThan(20);
    });

    it("should prefer moving elements over remove+add when possible", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [3, 4, 5, 1, 2];
      const mockOps = createMockNodeOps<number>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Should perform more moves than adds/removes
      const counts = operationUtils.countByType(mockOps.operations);
      expect(counts.moves).toBeGreaterThan(counts.adds + counts.removes);
    });
  });

  describe("String elements", () => {
    it("should handle string arrays correctly", () => {
      const oldNodes = ["a", "b", "c", "d"];
      const newNodes = ["d", "c", "b", "a"];
      const mockOps = createMockNodeOps<string>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Check operations were performed correctly
      const counts = operationUtils.countByType(mockOps.operations);
      expect(counts.moves).toBeGreaterThan(0);
    });

    it("should handle mixed string operations", () => {
      const oldNodes = ["apple", "banana", "cherry", "date"];
      const newNodes = ["banana", "elderberry", "date", "apple", "fig"];
      const mockOps = createMockNodeOps<string>();

      const states = doubleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Check correct operations were performed
      const counts = operationUtils.countByType(mockOps.operations);
      expect(counts.moves).toBeGreaterThan(0);
      expect(counts.adds).toBeGreaterThan(0);
      expect(counts.removes).toBeGreaterThan(0);

      // Verify specific operations
      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps.some((op) => op.element === "elderberry")).toBe(true);
      expect(addOps.some((op) => op.element === "fig")).toBe(true);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps.some((op) => op.element === "cherry")).toBe(true);
    });
  });
});
