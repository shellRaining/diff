import type { Node, Yallist } from "yallist";

export function insert<T>(node: Node<T>, list: Yallist<T>, anchor?: Node<T>) {
  if (!anchor) {
    list.pushNode(node);
    return node;
  }

  if (anchor.list !== list) {
    throw new Error("anchor node does not belong to this list");
  }

  if (node.next === anchor && node.list === list) {
    return node;
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  const prev = anchor.prev;

  if (!prev) {
    list.unshiftNode(node);
    return node;
  }

  node.list = list;
  node.prev = prev;
  node.next = anchor;
  anchor.prev = node;
  prev.next = node;
  list.length++;

  return node;
}

export const move = insert;

export function remove<T>(node: Node<T>, list: Yallist<T>) {
  return list.removeNode(node);
}
