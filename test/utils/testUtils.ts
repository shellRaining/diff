import type { ElementType, NodeOperations } from "../../src/nodeOps";

interface NodeMoveOps<T> {
  type: "move";
  fromIndex: number;
  toIndex: number;
  element: T;
}

interface NodeAddOps<T> {
  type: "add";
  element: T;
  index: number;
}

interface NodeRemoveOps<T> {
  type: "remove";
  index: number;
  element: T;
}

/**
 * Represents a diff operation performed by the nodeOps
 */
export type Operation<T> = NodeMoveOps<T> | NodeAddOps<T> | NodeRemoveOps<T>;

/**
 * Creates a mock implementation of nodeOps that records operations
 * for testing purposes
 */
export function createMockNodeOps<
  T extends ElementType,
>(): NodeOperations<T> & {
  operations: Operation<T>[];
  clear(): void;
} {
  const operations: Operation<T>[] = [];

  return {
    operations,

    clear() {
      operations.length = 0;
    },

    moveElement(array, fromIndex, toIndex) {
      const result = [...array];
      const [element] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, element);

      operations.push({
        type: "move",
        fromIndex,
        toIndex,
        element: element as T,
      });

      return result;
    },

    addElement(array, element, index) {
      const result = [...array];
      result.splice(index, 0, element);

      operations.push({
        type: "add",
        element,
        index,
      });

      return result;
    },

    removeElement(array, index) {
      const result = [...array];
      const element = result[index];
      result.splice(index, 1);

      operations.push({
        type: "remove",
        index,
        element: element as T,
      });

      return result;
    },

    findElementIndex(array, element) {
      return array.findIndex((item) => item === element);
    },
  };
}

function getByType<T>(
  operations: Operation<T>[],
  type: "move",
): NodeMoveOps<T>[];
function getByType<T>(operations: Operation<T>[], type: "add"): NodeAddOps<T>[];
function getByType<T>(
  operations: Operation<T>[],
  type: "remove",
): NodeRemoveOps<T>[];
function getByType<T>(
  operations: Operation<T>[],
  type: "move" | "add" | "remove",
): Operation<T>[] {
  return operations.filter((op) => op.type === type);
}

/**
 * Helper functions to analyze operations
 */
export const operationUtils = {
  /**
   * Count operations by type
   */
  countByType<T>(operations: Operation<T>[]): {
    moves: number;
    adds: number;
    removes: number;
  } {
    return {
      moves: operations.filter((op) => op.type === "move").length,
      adds: operations.filter((op) => op.type === "add").length,
      removes: operations.filter((op) => op.type === "remove").length,
    };
  },

  /**
   * Get operations of a specific type
   */
  getByType: getByType,

  /**
   * Convert operations to readable strings for debugging
   */
  formatOperations<T>(operations: Operation<T>[]): string[] {
    return operations.map((op) => {
      switch (op.type) {
        case "move":
          return `Move element ${op.element} from index ${op.fromIndex} to index ${op.toIndex}`;
        case "add":
          return `Add element ${op.element} at index ${op.index}`;
        case "remove":
          return `Remove element ${op.element} at index ${op.index}`;
      }
    });
  },
};
