// (C) 2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { IInvalidNode, IValidationSeverity } from "../types.js";
import {
    createInvalidDatapoint,
    getInvalidDatapointsInTree,
    getInvalidNodeAtPath,
    getUpdatedInvalidTree,
    validationSeverity,
} from "../utils.js";

describe("validation utils", () => {
    describe("validationSeverity", () => {
        it("should contain all severity levels", () => {
            expect(validationSeverity).toEqual(["info", "warning", "error"]);
        });

        it("should satisfy IValidationSeverity type", () => {
            const severities: IValidationSeverity[] = validationSeverity;
            expect(severities).toBeDefined();
        });
    });

    describe("createInvalidDatapoint", () => {
        it("should create datapoint with default values", () => {
            const datapoint = createInvalidDatapoint({ message: "Test error" });

            expect(datapoint.message).toBe("Test error");
            expect(datapoint.severity).toBe("error");
            expect(datapoint.id).toMatch(/^invalid-datapoint-/);
            expect(datapoint.id).toHaveLength(54); // UUID length + prefix (17 + 36 + 1 for dash)
        });

        it("should create datapoint with custom severity", () => {
            const datapoint = createInvalidDatapoint({
                message: "Test warning",
                severity: "warning",
            });

            expect(datapoint.message).toBe("Test warning");
            expect(datapoint.severity).toBe("warning");
        });

        it("should create datapoint with custom id", () => {
            const datapoint = createInvalidDatapoint({
                message: "Test info",
                severity: "info",
                id: "custom-id",
            });

            expect(datapoint.message).toBe("Test info");
            expect(datapoint.severity).toBe("info");
            expect(datapoint.id).toBe("custom-id");
        });
    });

    describe("getInvalidNodeAtPath", () => {
        const createTestNode = (): IInvalidNode => ({
            id: "root",
            invalidDatapoints: [createInvalidDatapoint({ message: "Root error" })],
            children: {
                child1: {
                    id: "child1",
                    invalidDatapoints: [createInvalidDatapoint({ message: "Child1 error" })],
                    children: {
                        grandchild: {
                            id: "grandchild",
                            invalidDatapoints: [createInvalidDatapoint({ message: "Grandchild error" })],
                            children: {},
                        },
                    },
                },
                child2: {
                    id: "child2",
                    invalidDatapoints: [],
                    children: {},
                },
            },
        });

        it("should return root node for empty path", () => {
            const node = createTestNode();
            const result = getInvalidNodeAtPath(node, []);

            expect(result).toBe(node);
        });

        it("should return child node for single-level path", () => {
            const node = createTestNode();
            const result = getInvalidNodeAtPath(node, ["child1"]);

            expect(result.id).toBe("child1");
            expect(result.invalidDatapoints[0].message).toBe("Child1 error");
        });

        it("should return nested node for multi-level path", () => {
            const node = createTestNode();
            const result = getInvalidNodeAtPath(node, ["child1", "grandchild"]);

            expect(result.id).toBe("grandchild");
            expect(result.invalidDatapoints[0].message).toBe("Grandchild error");
        });

        it("should throw error for invalid path", () => {
            const node = createTestNode();

            expect(() => getInvalidNodeAtPath(node, ["nonexistent"])).toThrow("Invalid path nonexistent");
        });

        it("should throw error for partially invalid path", () => {
            const node = createTestNode();

            expect(() => getInvalidNodeAtPath(node, ["child1", "nonexistent"])).toThrow(
                "Invalid path nonexistent",
            );
        });
    });

    describe("getInvalidDatapointsInTree", () => {
        it("should return datapoints from leaf node", () => {
            const leafNode: IInvalidNode = {
                id: "leaf",
                invalidDatapoints: [
                    createInvalidDatapoint({ message: "Error 1" }),
                    createInvalidDatapoint({ message: "Error 2" }),
                ],
                children: {},
            };

            const result = getInvalidDatapointsInTree(leafNode);

            expect(result).toHaveLength(2);
            expect(result[0].message).toBe("Error 1");
            expect(result[1].message).toBe("Error 2");
        });

        it("should return datapoints from tree with children", () => {
            const treeNode: IInvalidNode = {
                id: "root",
                invalidDatapoints: [createInvalidDatapoint({ message: "Root error" })],
                children: {
                    child1: {
                        id: "child1",
                        invalidDatapoints: [createInvalidDatapoint({ message: "Child1 error" })],
                        children: {},
                    },
                    child2: {
                        id: "child2",
                        invalidDatapoints: [
                            createInvalidDatapoint({ message: "Child2 error 1" }),
                            createInvalidDatapoint({ message: "Child2 error 2" }),
                        ],
                        children: {},
                    },
                },
            };

            const result = getInvalidDatapointsInTree(treeNode);

            expect(result).toHaveLength(4);
            expect(result[0].message).toBe("Root error");
            expect(result[1].message).toBe("Child1 error");
            expect(result[2].message).toBe("Child2 error 1");
            expect(result[3].message).toBe("Child2 error 2");
        });

        it("should return datapoints from deeply nested tree", () => {
            const deepNode: IInvalidNode = {
                id: "root",
                invalidDatapoints: [createInvalidDatapoint({ message: "Root error" })],
                children: {
                    level1: {
                        id: "level1",
                        invalidDatapoints: [createInvalidDatapoint({ message: "Level1 error" })],
                        children: {
                            level2: {
                                id: "level2",
                                invalidDatapoints: [createInvalidDatapoint({ message: "Level2 error" })],
                                children: {},
                            },
                        },
                    },
                },
            };

            const result = getInvalidDatapointsInTree(deepNode);

            expect(result).toHaveLength(3);
            expect(result[0].message).toBe("Root error");
            expect(result[1].message).toBe("Level1 error");
            expect(result[2].message).toBe("Level2 error");
        });

        it("should return empty array for node with no datapoints", () => {
            const emptyNode: IInvalidNode = {
                id: "empty",
                invalidDatapoints: [],
                children: {},
            };

            const result = getInvalidDatapointsInTree(emptyNode);

            expect(result).toEqual([]);
        });
    });

    describe("getUpdatedInvalidTree", () => {
        const createTestNode = (): IInvalidNode => ({
            id: "root",
            invalidDatapoints: [createInvalidDatapoint({ message: "Root error" })],
            children: {
                child1: {
                    id: "child1",
                    invalidDatapoints: [createInvalidDatapoint({ message: "Child1 error" })],
                    children: {
                        grandchild: {
                            id: "grandchild",
                            invalidDatapoints: [createInvalidDatapoint({ message: "Grandchild error" })],
                            children: {},
                        },
                    },
                },
                child2: {
                    id: "child2",
                    invalidDatapoints: [],
                    children: {},
                },
            },
        });

        it("should update root node for empty path", () => {
            const node = createTestNode();
            const updater = (current: IInvalidNode) => ({
                ...current,
                invalidDatapoints: [createInvalidDatapoint({ message: "Updated root error" })],
            });

            const result = getUpdatedInvalidTree(node, updater, []);

            expect(result.invalidDatapoints[0].message).toBe("Updated root error");
            expect(result.children["child1"].invalidDatapoints[0].message).toBe("Child1 error"); // Unchanged
        });

        it("should update child node for single-level path", () => {
            const node = createTestNode();
            const updater = (current: IInvalidNode) => ({
                ...current,
                invalidDatapoints: [createInvalidDatapoint({ message: "Updated child1 error" })],
            });

            const result = getUpdatedInvalidTree(node, updater, ["child1"]);

            expect(result.invalidDatapoints[0].message).toBe("Root error"); // Unchanged
            expect(result.children["child1"].invalidDatapoints[0].message).toBe("Updated child1 error");
            expect(result.children["child2"].invalidDatapoints).toEqual([]); // Unchanged
        });

        it("should update nested node for multi-level path", () => {
            const node = createTestNode();
            const updater = (current: IInvalidNode) => ({
                ...current,
                invalidDatapoints: [createInvalidDatapoint({ message: "Updated grandchild error" })],
            });

            const result = getUpdatedInvalidTree(node, updater, ["child1", "grandchild"]);

            expect(result.invalidDatapoints[0].message).toBe("Root error"); // Unchanged
            expect(result.children["child1"].invalidDatapoints[0].message).toBe("Child1 error"); // Unchanged
            expect(result.children["child1"].children.grandchild.invalidDatapoints[0].message).toBe(
                "Updated grandchild error",
            );
        });

        it("should throw error for invalid path", () => {
            const node = createTestNode();
            const updater = (current: IInvalidNode) => current;

            expect(() => getUpdatedInvalidTree(node, updater, ["nonexistent"])).toThrow(
                "Invalid path nonexistent",
            );
        });

        it("should preserve immutability", () => {
            const node = createTestNode();
            const originalChild1 = node.children["child1"];
            const updater = (current: IInvalidNode) => ({
                ...current,
                invalidDatapoints: [createInvalidDatapoint({ message: "Updated error" })],
            });

            const result = getUpdatedInvalidTree(node, updater, ["child1"]);

            expect(result).not.toBe(node);
            expect(result.children["child1"]).not.toBe(originalChild1);
            expect(originalChild1.invalidDatapoints[0].message).toBe("Child1 error"); // Original unchanged
        });
    });
});
