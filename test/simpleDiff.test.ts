import { describe, it, expect } from "vitest";
import { simpleDiff } from "../src/simpleDiff";
import { createMockNodeOps, operationUtils } from "./utils/testUtils";
import { nodeOps } from "../src/nodeOps";

describe("nodeOps utilities", () => {
  describe("moveElement", () => {
    it("should move element from one index to another", () => {
      const array = [1, 2, 3, 4, 5];
      const result = nodeOps.moveElement(array, 1, 3);
      expect(result).toEqual([1, 3, 4, 2, 5]);
      // Original array should not be modified
      expect(array).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle edge case moves", () => {
      // Move from start to end
      expect(nodeOps.moveElement([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
      // Move from end to start
      expect(nodeOps.moveElement([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);
      // Move to same position (no change)
      expect(nodeOps.moveElement([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
    });
  });

  describe("addElement", () => {
    it("should add element at specified index", () => {
      const array = [1, 2, 4, 5];
      const result = nodeOps.addElement(array, 3, 2);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      // Original array should not be modified
      expect(array).toEqual([1, 2, 4, 5]);
    });

    it("should handle edge case additions", () => {
      // Add to beginning
      expect(nodeOps.addElement([2, 3], 1, 0)).toEqual([1, 2, 3]);
      // Add to end
      expect(nodeOps.addElement([1, 2], 3, 2)).toEqual([1, 2, 3]);
      // Add to empty array
      expect(nodeOps.addElement([], 1, 0)).toEqual([1]);
    });
  });

  describe("removeElement", () => {
    it("should remove element at specified index", () => {
      const array = [1, 2, 3, 4, 5];
      const result = nodeOps.removeElement(array, 2);
      expect(result).toEqual([1, 2, 4, 5]);
      // Original array should not be modified
      expect(array).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle edge case removals", () => {
      // Remove from beginning
      expect(nodeOps.removeElement([1, 2, 3], 0)).toEqual([2, 3]);
      // Remove from end
      expect(nodeOps.removeElement([1, 2, 3], 2)).toEqual([1, 2]);
      // Remove single element
      expect(nodeOps.removeElement([1], 0)).toEqual([]);
    });
  });

  describe("findElementIndex", () => {
    it("should find the index of an element", () => {
      const array = [1, 2, 3, 4, 5];
      expect(nodeOps.findElementIndex(array, 3)).toBe(2);
      expect(nodeOps.findElementIndex(array, 6)).toBe(-1);
    });

    it("should return first index for duplicate elements", () => {
      expect(nodeOps.findElementIndex([1, 2, 2, 3], 2)).toBe(1);
    });
  });
});

describe("simpleDiff algorithm", () => {
  describe("Basic cases", () => {
    it("should handle identical arrays without changes", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states).toHaveLength(1);
      expect(states[0]).toEqual(oldNodes);
      expect(mockOps.operations).toHaveLength(0);
    });

    it("should handle empty arrays", () => {
      const emptyArray: number[] = [];

      // Empty old array to non-empty new array
      const mockOps1 = createMockNodeOps<number>();
      const states1 = simpleDiff(emptyArray, [1, 2, 3], mockOps1);
      expect(states1[states1.length - 1]).toEqual([1, 2, 3]);
      expect(mockOps1.operations).toHaveLength(3);
      expect(operationUtils.countByType(mockOps1.operations).adds).toBe(3);

      // Non-empty old array to empty new array
      const mockOps2 = createMockNodeOps<number>();
      const states2 = simpleDiff([1, 2, 3], emptyArray, mockOps2);
      expect(states2[states2.length - 1]).toEqual([]);
      expect(mockOps2.operations).toHaveLength(3);
      expect(operationUtils.countByType(mockOps2.operations).removes).toBe(3);

      // Both empty arrays
      const mockOps3 = createMockNodeOps<number>();
      const states3 = simpleDiff(emptyArray, emptyArray, mockOps3);
      expect(states3).toHaveLength(1);
      expect(states3[0]).toEqual([]);
      expect(mockOps3.operations).toHaveLength(0);
    });
  });

  describe("Addition operations", () => {
    it("should handle additions at the beginning", () => {
      const oldNodes = [2, 3, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps).toHaveLength(1);
      expect(addOps[0].element).toBe(1);
      expect(addOps[0].index).toBe(0);
    });

    it("should handle additions at the end", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps).toHaveLength(1);
      expect(addOps[0].element).toBe(4);
    });

    it("should handle additions in the middle", () => {
      const oldNodes = [1, 2, 4];
      const newNodes = [1, 2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps).toHaveLength(1);
      expect(addOps[0].element).toBe(3);
      expect(addOps[0].index).toBe(2);
    });

    it("should handle multiple additions", () => {
      const oldNodes = [1, 5];
      const newNodes = [1, 2, 3, 4, 5];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps).toHaveLength(3);
      // Check elements were added in the right order
      expect(addOps.map((op) => op.element)).toEqual([2, 3, 4]);
    });
  });

  describe("Removal operations", () => {
    it("should handle removals from the beginning", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [2, 3, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps).toHaveLength(1);
      expect(removeOps[0].element).toBe(1);
    });

    it("should handle removals from the end", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 3];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps).toHaveLength(1);
      expect(removeOps[0].element).toBe(4);
    });

    it("should handle removals from the middle", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 2, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps).toHaveLength(1);
      expect(removeOps[0].element).toBe(3);
    });

    it("should handle multiple removals", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [1, 5];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps).toHaveLength(3);
      // The elements should be removed in reverse order to maintain indices
      expect(removeOps.map((op) => op.element).sort()).toEqual([2, 3, 4]);
    });
  });

  describe("Move operations", () => {
    it("should handle simple moves", () => {
      const oldNodes = [1, 2, 3, 4];
      const newNodes = [1, 3, 2, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      // Should include a move operation
      const moveOps = operationUtils.getByType(mockOps.operations, "move");
      expect(moveOps).toHaveLength(1);

      // Element 3 should move before element 2
      const moveOp = moveOps[0];
      expect(moveOp.element).toBe(2);
      expect(moveOp.fromIndex).toBeLessThan(moveOp.toIndex);
    });

    it("should handle multiple moves", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [1, 4, 3, 2, 5];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      // Should include multiple move operations
      const moveOps = operationUtils.getByType(mockOps.operations, "move");
      expect(moveOps.length).toBeGreaterThan(1);
    });

    it("should account for indices changing after moves", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [5, 4, 3, 2, 1];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      // Check number of operations
      const moveOps = operationUtils.getByType(mockOps.operations, "move");
      expect(moveOps.length).toBeGreaterThan(0);

      // Each state should be a valid intermediate transformation
      let lastValidState = oldNodes;
      for (let i = 1; i < states.length; i++) {
        const currentState = states[i];
        // Each state should have all elements from the original array
        expect(currentState.length).toBe(oldNodes.length);
        expect(new Set(currentState)).toEqual(new Set(oldNodes));
        lastValidState = currentState;
      }

      // Final state should match new nodes
      expect(lastValidState).toEqual(newNodes);
    });
  });

  describe("Complex transformations", () => {
    it("should handle combinations of adds, removes, and moves", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [5, 2, 6, 3, 7];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const counts = operationUtils.countByType(mockOps.operations);

      // Should include all three operation types
      expect(counts.adds).toBeGreaterThan(0);
      expect(counts.removes).toBeGreaterThan(0);
      expect(counts.moves).toBeGreaterThan(0);

      // Verify specific operations
      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps.some((op) => op.element === 6)).toBe(true);
      expect(addOps.some((op) => op.element === 7)).toBe(true);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps.some((op) => op.element === 1)).toBe(true);
      expect(removeOps.some((op) => op.element === 4)).toBe(true);
    });

    it("should handle arrays with repeated elements", () => {
      const oldNodes = [1, 2, 2, 3, 4];
      const newNodes = [1, 2, 3, 2, 4];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);
    });

    it("should handle completely different arrays", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [4, 5, 6];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1]).toEqual(newNodes);

      const counts = operationUtils.countByType(mockOps.operations);
      expect(counts.adds).toBe(3);
      expect(counts.removes).toBe(3);
    });

    it("should handle one array being a subset of the other", () => {
      // Old array is a subset of new array
      const mockOps1 = createMockNodeOps<number>();
      const states1 = simpleDiff([1, 2, 3], [1, 2, 3, 4, 5], mockOps1);
      expect(states1[states1.length - 1]).toEqual([1, 2, 3, 4, 5]);
      expect(operationUtils.countByType(mockOps1.operations).adds).toBe(2);

      // New array is a subset of old array
      const mockOps2 = createMockNodeOps<number>();
      const states2 = simpleDiff([1, 2, 3, 4, 5], [1, 2, 3], mockOps2);
      expect(states2[states2.length - 1]).toEqual([1, 2, 3]);
      expect(operationUtils.countByType(mockOps2.operations).removes).toBe(2);
    });
  });

  describe("Algorithm-specific behavior", () => {
    it("should process additions before removals", () => {
      const oldNodes = [1, 2, 3];
      const newNodes = [4, 2, 5];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // In simple diff, additions should happen before removals
      const addIndices = mockOps.operations
        .map((op, i) => (op.type === "add" ? i : -1))
        .filter((i) => i !== -1);

      const removeIndices = mockOps.operations
        .map((op, i) => (op.type === "remove" ? i : -1))
        .filter((i) => i !== -1);

      if (addIndices.length > 0 && removeIndices.length > 0) {
        expect(Math.max(...addIndices)).toBeLessThan(
          Math.min(...removeIndices),
        );
      }
    });

    it("should maintain the relative order of existing nodes", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [6, 2, 7, 5, 3, 8];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // In final result, the relative order of 2, 3, 5 should be maintained
      // except when explicit moves occur
      const finalState = states[states.length - 1];
      const index2 = finalState.indexOf(2);
      const index3 = finalState.indexOf(3);
      const index5 = finalState.indexOf(5);

      // If no move operations affected these elements, their relative order should be preserved
      const moveElements = operationUtils
        .getByType(mockOps.operations, "move")
        .map((op) => op.element);

      if (
        !moveElements.includes(2) &&
        !moveElements.includes(3) &&
        !moveElements.includes(5)
      ) {
        // Check if 2 comes before 3 in both arrays
        const oldOrder23 = oldNodes.indexOf(2) < oldNodes.indexOf(3);
        const newOrder23 = index2 < index3;
        expect(oldOrder23).toBe(newOrder23);

        // Check if 3 comes before 5 in both arrays
        const oldOrder35 = oldNodes.indexOf(3) < oldNodes.indexOf(5);
        const newOrder35 = index3 < index5;
        expect(oldOrder35).toBe(newOrder35);
      }
    });
  });

  describe("String elements", () => {
    it("should handle string arrays correctly", () => {
      const oldNodes = ["a", "b", "c", "d"];
      const newNodes = ["e", "b", "c", "f"];
      const mockOps = createMockNodeOps<string>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Verify specific operations
      const addOps = operationUtils.getByType(mockOps.operations, "add");
      expect(addOps.some((op) => op.element === "e")).toBe(true);
      expect(addOps.some((op) => op.element === "f")).toBe(true);

      const removeOps = operationUtils.getByType(mockOps.operations, "remove");
      expect(removeOps.some((op) => op.element === "a")).toBe(true);
      expect(removeOps.some((op) => op.element === "d")).toBe(true);
    });
  });

  describe("Algorithm efficiency", () => {
    it("should not perform unnecessary operations on unchanged elements", () => {
      const oldNodes = [1, 2, 3, 4, 5];
      const newNodes = [1, 2, 6, 4, 5];
      const mockOps = createMockNodeOps<number>();

      const states = simpleDiff(oldNodes, newNodes, mockOps);

      expect(states[states.length - 1]).toEqual(newNodes);

      // Elements 1, 2, 4, 5 should not be moved or removed
      const allOps = mockOps.operations;
      const untouchedElements = [1, 2, 4, 5];

      for (const element of untouchedElements) {
        const elementOps = allOps.filter(
          (op) =>
            (op.type === "move" && op.element === element) ||
            (op.type === "remove" && op.element === element),
        );
        expect(elementOps).toHaveLength(0);
      }
    });
  });
});
