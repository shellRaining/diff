import { type NodeOperations, type ElementType, nodeOps } from "./nodeOps";

function doubleDiff<T extends ElementType>(
  oldNodes: T[],
  newNodes: T[],
  ops: NodeOperations<T> = nodeOps as NodeOperations<T>,
): T[][] {
  const { moveElement, addElement, removeElement, findElementIndex } = ops;
  const states: T[][] = [oldNodes.slice()];

  let oldStartIdx = 0,
    newStartIdx = 0;
  let oldEndIdx = oldNodes.length - 1,
    newEndIdx = newNodes.length - 1;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    const curState = states.at(-1)!;
    const oldStartVal = oldNodes[oldStartIdx];
    const oldEndVal = oldNodes[oldEndIdx];
    const newStartVal = newNodes[newStartIdx];
    const newEndVal = newNodes[newEndIdx];
    if (oldStartVal === null) {
      oldStartIdx++;
    } else if (oldStartVal === newStartVal) {
      oldStartIdx++;
      newStartIdx++;
    } else if (oldEndVal === newEndVal) {
      oldEndIdx--;
      newEndIdx--;
    } else if (oldStartVal === newEndVal) {
      const movedFromIdx = findElementIndex(curState, oldStartVal);
      const movedToIdx = findElementIndex(curState, oldEndVal);
      const newState = moveElement(curState, movedFromIdx, movedToIdx);
      states.push(newState);
      oldStartIdx++;
      newEndIdx--;
    } else if (oldEndVal === newStartVal) {
      const movedFromIdx = findElementIndex(curState, oldEndVal);
      const movedToIdx = findElementIndex(curState, oldStartVal);
      const newState = moveElement(curState, movedFromIdx, movedToIdx);
      states.push(newState);
      oldEndIdx--;
      newStartIdx++;
    } else {
      const removedIdx = findElementIndex(oldNodes, newStartVal);
      const movedFromIdx = findElementIndex(curState, newStartVal);
      const movedToIdx = findElementIndex(curState, oldStartVal);
      let newState: T[];
      if (removedIdx === -1) {
        newState = addElement(curState, newStartVal, movedToIdx);
      } else {
        newState = moveElement(curState, movedFromIdx, movedToIdx);
        oldNodes[removedIdx] = null as unknown as T;
      }
      states.push(newState);
      newStartIdx++;
    }
  }

  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const curState = states.at(-1)!;
      const movedToIdx = findElementIndex(curState, oldNodes[oldStartIdx]);
      const newState = addElement(
        curState,
        newNodes[i],
        movedToIdx === -1 ? curState.length : movedToIdx,
      );
      states.push(newState);
    }
  } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldNodes[i] === null) continue;
      const curState = states.at(-1)!;
      const removedIdx = findElementIndex(curState, oldNodes[i]);
      const newState = removeElement(curState, removedIdx);
      states.push(newState);
    }
  }

  return states;
}

export { doubleDiff };
