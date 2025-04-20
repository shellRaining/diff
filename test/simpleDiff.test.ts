import { describe, it, expect } from "vitest";

import { createTestCase, diff } from "../src/simpleDiff";

describe("SimpleDiff Algorithm", () => {
  it("should correctly process states after each operation", () => {
    // 测试用例1：基础输入输出测试
    const oldState = [1, 2, 3, 4];
    const newState = [3, 5, 1];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states } = diff(oldVNodes, newVNodes);

    // 检查初始状态
    expect(states[0]).toEqual([1, 2, 3, 4]);
    // 检查插入5后的状态
    expect(states[1]).toEqual([1, 2, 3, 5, 4]);
    // 检查移动1后的状态
    expect(states[2]).toEqual([2, 3, 5, 1, 4]);
    // 检查删除2后的状态
    expect(states[3]).toEqual([3, 5, 1, 4]);
    // 检查删除4后的状态
    expect(states[4]).toEqual([3, 5, 1]);
    // 检查最终状态
    expect(states[states.length - 1]).toEqual(newState);
  });

  it("should correctly handle moves, inserts and removals", () => {
    // 测试用例2：复杂的移动、插入和删除操作
    const oldState = [10, 20, 30, 40, 50];
    const newState = [30, 60, 10, 70];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states } = diff(oldVNodes, newVNodes);

    // 检查初始状态
    expect(states[0]).toEqual([10, 20, 30, 40, 50]);
    // 处理30：30已在列表中，无变化
    // 处理60：在30后插入60
    expect(states[1]).toEqual([10, 20, 30, 60, 40, 50]);
    // 处理10：移动10到60后
    expect(states[2]).toEqual([20, 30, 60, 10, 40, 50]);
    // 处理70：在10后插入70
    expect(states[3]).toEqual([20, 30, 60, 10, 70, 40, 50]);
    // 删除20（不在新列表中）
    expect(states[4]).toEqual([30, 60, 10, 70, 40, 50]);
    // 删除40（不在新列表中）
    expect(states[5]).toEqual([30, 60, 10, 70, 50]);
    // 删除50（不在新列表中）
    expect(states[6]).toEqual([30, 60, 10, 70]);
    // 检查最终状态
    expect(states[states.length - 1]).toEqual(newState);
  });

  it("should handle empty old state", () => {
    const oldState: number[] = [];
    const newState = [1, 2, 3];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states } = diff(oldVNodes, newVNodes);

    // 检查初始状态
    expect(states[0]).toEqual([]);
    // 检查插入1的状态
    expect(states[1]).toEqual([1]);
    // 检查插入2的状态
    expect(states[2]).toEqual([1, 2]);
    // 检查插入3的状态
    expect(states[3]).toEqual([1, 2, 3]);
    // 检查最终状态
    expect(states[states.length - 1]).toEqual(newState);
  });

  it("should handle empty new state", () => {
    const oldState = [1, 2, 3];
    const newState: number[] = [];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states } = diff(oldVNodes, newVNodes);

    // 检查初始状态
    expect(states[0]).toEqual([1, 2, 3]);
    // 检查删除1的状态
    expect(states[1]).toEqual([2, 3]);
    // 检查删除2的状态
    expect(states[2]).toEqual([3]);
    // 检查删除3的状态
    expect(states[3]).toEqual([]);
    // 检查最终状态
    expect(states[states.length - 1]).toEqual(newState);
  });

  it("should handle reordering with no insertions or deletions", () => {
    const oldState = [1, 2, 3, 4];
    const newState = [4, 2, 3, 1];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states } = diff(oldVNodes, newVNodes);

    // 检查初始状态和各操作后的状态
    expect(states[0]).toEqual([1, 2, 3, 4]);

    // 注意：实际的中间状态取决于diff算法的具体实现
    // 这里我们只检查最终状态
    expect(states[states.length - 1]).toEqual(newState);
  });

  it("should handle completely different old and new states", () => {
    const oldState = [1, 2, 3, 4];
    const newState = [5, 6, 7];
    const { oldVNodes, newVNodes } = createTestCase(oldState, newState);
    const { states, operations } = diff(oldVNodes, newVNodes);

    // 检查初始状态
    expect(states[0]).toEqual([1, 2, 3, 4]);

    // 检查最终状态
    expect(states[states.length - 1]).toEqual(newState);

    // 检查操作数量：应该有4个删除和3个插入
    expect(operations.filter((op) => op.type === "remove").length).toEqual(4);
    expect(operations.filter((op) => op.type === "insert").length).toEqual(3);
  });
});
