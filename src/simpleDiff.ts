import { Node, Yallist } from "yallist";
import { insert, move, remove } from "./linkedListOps";

type KeyType = string;
interface VNode<T> {
  key: KeyType;
  el: Node<T>;
}

type InsertOperation<T> = { type: "insert"; value: T; anchor?: T };
type RemoveOperation<T> = { type: "remove"; value: T };
type MoveOperation<T> = { type: "move"; value: T; anchor?: T };
type Operation<T> = InsertOperation<T> | RemoveOperation<T> | MoveOperation<T>;

export function createTestCase<T>(oldState: T[], newState: T[]) {
  const list = new Yallist(oldState);
  const map = new Map<KeyType, Node<T>>();
  let p = list.head;
  let cnt = 0;

  const oldVNodes: VNode<T>[] = new Array(oldState.length);
  const newVNodes: VNode<T>[] = new Array(newState.length);

  while (p) {
    const key = String(oldState[cnt]);
    map.set(key, p);
    oldVNodes[cnt] = { key, el: p };
    p = p.next;
    cnt++;
  }

  for (let i = 0; i < newState.length; i++) {
    const key = String(newState[i]);
    let el = map.get(key) ?? new Node<T>(newState[i]);
    newVNodes[i] = { key, el };
  }

  return { oldVNodes, newVNodes };
}

export function diff<T>(
  oldVNodes: VNode<T>[],
  newVNodes: VNode<T>[],
): { states: T[][]; operations: Operation<T>[] } {
  const initState = oldVNodes.map((v) => v.el.value);
  const states: T[][] = [initState];
  const operations: Operation<T>[] = [];
  const oldList = oldVNodes[0]?.el.list ?? new Yallist();

  let latestIdx = 0;
  for (let i = 0; i < newVNodes.length; i++) {
    const newVNode = newVNodes[i];
    let found = false;
    for (let j = 0; j < oldVNodes.length; j++) {
      const oldVNode = oldVNodes[j];
      if (oldVNode.key === newVNode.key) {
        found = true;
        if (j >= latestIdx) {
          latestIdx = j;
        } else {
          const prevVNode = newVNodes[i - 1];
          if (prevVNode) {
            const anchor = prevVNode.el.next;
            const oldEl = oldVNode.el;
            move(oldEl, oldList, anchor);
            states.push(oldList.toArray());
            operations.push({
              type: "move",
              value: oldEl.value,
              anchor: anchor?.value,
            });
          } else {
          }
        }
      }
    }

    if (!found) {
      const prevVNode = newVNodes[i - 1];
      let anchor = null;
      if (prevVNode) {
        anchor = prevVNode.el.next;
      } else {
        anchor = oldList.head;
      }
      insert(newVNode.el, oldList, anchor);
      states.push(oldList.toArray());
      operations.push({
        type: "insert",
        value: newVNode.el.value,
        anchor: anchor?.value,
      });
    }
  }

  for (let i = 0; i < oldVNodes.length; i++) {
    const oldVNode = oldVNodes[i];
    const has = newVNodes.find((item) => item.key === oldVNode.key);
    if (!has) {
      remove(oldVNode.el, oldList);
      states.push(oldList.toArray());
      operations.push({ type: "remove", value: oldVNode.el.value });
    }
  }

  return { states, operations };
}
