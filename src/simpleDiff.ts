import { type NodeOperations, type ElementType, nodeOps } from "./nodeOps";

function simpleDiff<T extends ElementType>(
  oldNodes: T[],
  newNodes: T[],
  ops: NodeOperations<T> = nodeOps as NodeOperations<T>,
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

export { simpleDiff };
