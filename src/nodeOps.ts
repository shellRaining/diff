type ElementType = string | number;

interface NodeOperations<T> {
  moveElement(array: T[], fromIndex: number, toIndex: number): T[];
  addElement(array: T[], element: T, index: number): T[];
  removeElement(array: T[], index: number): T[];
  findElementIndex(array: T[], element: T): number;
}

const nodeOps: NodeOperations<ElementType> = {
  moveElement(array, fromIndex, toIndex) {
    const result = [...array];
    const [element] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, element);
    return result;
  },

  addElement(array, element, index) {
    const result = [...array];
    result.splice(index, 0, element);
    return result;
  },

  removeElement(array, index) {
    const result = [...array];
    result.splice(index, 1);
    return result;
  },

  findElementIndex(array, element) {
    return array.findIndex((item) => item === element);
  },
};

export type { ElementType, NodeOperations };
export { nodeOps };
