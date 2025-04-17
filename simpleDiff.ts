type ElementType = string | number | object;

interface NodeOperations<T> {
  moveElement(array: T[], fromIndex: number, toIndex: number): T[];
  addElement(array: T[], element: T, index: number): T[];
  removeElement(array: T[], index: number): T[];
  findElementIndex(array: T[], element: T): number;
}

const NodeOps: NodeOperations<ElementType> = {
  moveElement(array, fromIndex, toIndex) {
    const result = [...array];
    const [element] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, element);
    console.log(`将 ${element} 移动到 ${array[toIndex - 1]} 后`);
    return result;
  },

  addElement(array, element, index) {
    const result = [...array];
    result.splice(index, 0, element);
    if (index === 0) console.log(`将 ${element} 添加到最前边`);
    else console.log(`将 ${element} 添加到 ${array[index - 1]} 后`);
    return result;
  },

  removeElement(array, index) {
    const result = [...array];
    result.splice(index, 1);
    console.log(`删除 ${array[index]}`);
    return result;
  },

  findElementIndex(array, element) {
    return array.findIndex((item) => item === element);
  },
};

function diff<T extends ElementType>(
  oldNodes: T[],
  newNodes: T[],
  ops: NodeOperations<T> = NodeOps as NodeOperations<T>,
): T[][] {
  const { moveElement, addElement, removeElement, findElementIndex } = ops;
  const states: T[][] = [oldNodes.slice()];

  // Process additions and moves
  let lastFoundIndex = 0;

  for (const [index, currentNode] of newNodes.entries()) {
    const currentState = states[states.length - 1];
    let nextState = currentState.slice();
    const oldNodeIndex = findElementIndex(oldNodes, currentNode);

    // Handle existing nodes
    if (oldNodeIndex !== -1) {
      if (oldNodeIndex >= lastFoundIndex) {
        // Node is already in correct position or later
        lastFoundIndex = oldNodeIndex;
        states.push(currentState.slice());
      } else if (index > 0) {
        // Node needs to be moved after previous node
        const prevNode = newNodes[index - 1];
        const prevNodePosition = findElementIndex(currentState, prevNode);
        const currentNodePosition = findElementIndex(currentState, currentNode);

        nextState = moveElement(
          currentState,
          currentNodePosition,
          prevNodePosition,
        );
        states.push(nextState);
      }
    }
    // Handle new nodes
    else {
      if (index > 0) {
        // Add after previous node
        const prevNode = newNodes[index - 1];
        const prevNodePosition = findElementIndex(currentState, prevNode);

        nextState = addElement(currentState, currentNode, prevNodePosition + 1);
      } else {
        // Add to beginning
        nextState = addElement(currentState, currentNode, 0);
      }
      states.push(nextState);
    }
  }

  // Process removals
  for (const oldNode of oldNodes) {
    if (findElementIndex(newNodes, oldNode) === -1) {
      const currentState = states[states.length - 1];
      const oldNodePosition = findElementIndex(currentState, oldNode);
      const nextState = removeElement(currentState, oldNodePosition);

      states.push(nextState);
    }
  }

  return states;
}

export { diff, NodeOps, type ElementType, type NodeOperations };
