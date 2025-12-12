// (C) 2025 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { describe, expectTypeOf, it } from "vitest";

import {
    type IInvalidDatapoint,
    type IInvalidNode,
    type IInvalidNodeAtPath,
    type IInvalidNodePath,
    type IValidationContextValue,
    type IValidationSeverity,
} from "../types.js";

describe("Validation Types", () => {
    describe("IValidationSeverity", () => {
        it("should be a union of specific string literals", () => {
            expectTypeOf<IValidationSeverity>().toEqualTypeOf<"error" | "warning" | "info">();
        });

        it("should accept valid severity values", () => {
            expectTypeOf<"error">().toMatchTypeOf<IValidationSeverity>();
            expectTypeOf<"warning">().toMatchTypeOf<IValidationSeverity>();
            expectTypeOf<"info">().toMatchTypeOf<IValidationSeverity>();
        });

        it("should reject invalid severity values", () => {
            expectTypeOf<"debug">().not.toMatchTypeOf<IValidationSeverity>();
            expectTypeOf<"critical">().not.toMatchTypeOf<IValidationSeverity>();
        });
    });

    describe("IInvalidDatapoint", () => {
        it("should have required properties with correct types", () => {
            type TestDatapoint = IInvalidDatapoint;

            expectTypeOf<TestDatapoint["id"]>().toEqualTypeOf<string>();
            expectTypeOf<TestDatapoint["severity"]>().toEqualTypeOf<IValidationSeverity>();
            expectTypeOf<TestDatapoint["message"]>().toEqualTypeOf<string>();
        });

        it("should be assignable from valid objects", () => {
            const validDatapoint = {
                id: "test-id",
                severity: "error" as const,
                message: "Test message",
            };
            expectTypeOf(validDatapoint).toMatchTypeOf<IInvalidDatapoint>();
        });

        it("should reject objects with missing properties", () => {
            expectTypeOf<{ id: string }>().not.toMatchTypeOf<IInvalidDatapoint>();
            expectTypeOf<{
                id: string;
                severity: IValidationSeverity;
            }>().not.toMatchTypeOf<IInvalidDatapoint>();
        });
    });

    describe("IInvalidNode", () => {
        it("should have required properties with correct types", () => {
            type TestNode = IInvalidNode;

            expectTypeOf<TestNode["id"]>().toEqualTypeOf<string>();
            expectTypeOf<TestNode["invalidDatapoints"]>().toEqualTypeOf<IInvalidDatapoint[]>();
            expectTypeOf<TestNode["children"]>().toEqualTypeOf<Record<string, IInvalidNode<any>>>();
        });

        it("should work with empty children", () => {
            type EmptyNode = IInvalidNode<{}>;
            expectTypeOf<EmptyNode["children"]>().toEqualTypeOf<{}>();
        });

        it("should work with typed children", () => {
            type NodeWithChildren = IInvalidNode<{
                child1: IInvalidNode;
                child2: IInvalidNode<{ grandchild: IInvalidNode }>;
            }>;

            expectTypeOf<NodeWithChildren["children"]["child1"]>().toMatchTypeOf<IInvalidNode>();
            expectTypeOf<NodeWithChildren["children"]["child2"]>().toMatchTypeOf<
                IInvalidNode<{ grandchild: IInvalidNode }>
            >();
        });

        it("should support recursive structures", () => {
            type RecursiveNode = IInvalidNode<{
                self: IInvalidNode<{ self: IInvalidNode }>;
            }>;

            expectTypeOf<RecursiveNode["children"]["self"]>().toMatchTypeOf<IInvalidNode>();
        });
    });

    describe("IInvalidNodePath", () => {
        type SimpleNode = IInvalidNode<{
            child1: IInvalidNode;
            child2: IInvalidNode<{ grandchild: IInvalidNode }>;
        }>;

        it("should include empty path for root access", () => {
            expectTypeOf<[]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
        });

        it("should include single-level paths", () => {
            expectTypeOf<["child1"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
            expectTypeOf<["child2"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
        });

        it("should include multi-level paths", () => {
            expectTypeOf<["child2", "grandchild"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
        });

        it("should work with valid paths only", () => {
            // Test that valid paths are accepted
            expectTypeOf<[]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
            expectTypeOf<["child1"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
            expectTypeOf<["child2"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
            expectTypeOf<["child2", "grandchild"]>().toMatchTypeOf<IInvalidNodePath<SimpleNode>>();
        });

        it("should work with empty children nodes", () => {
            type EmptyNode = IInvalidNode<{}>;
            expectTypeOf<[]>().toMatchTypeOf<IInvalidNodePath<EmptyNode>>();
            // Empty nodes accept empty paths
            expectTypeOf<EmptyNode["children"]>().toEqualTypeOf<{}>();
        });
    });

    describe("IInvalidNodeAtPath", () => {
        type TestNode = IInvalidNode<{
            child1: IInvalidNode;
            child2: IInvalidNode<{
                grandchild: IInvalidNode<{
                    greatGrandchild: IInvalidNode;
                }>;
            }>;
        }>;

        it("should return root node for empty path", () => {
            expectTypeOf<IInvalidNodeAtPath<TestNode, []>>().toEqualTypeOf<TestNode>();
        });

        it("should return correct child for single-level path", () => {
            expectTypeOf<IInvalidNodeAtPath<TestNode, ["child1"]>>().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<IInvalidNodeAtPath<TestNode, ["child2"]>>().toEqualTypeOf<
                IInvalidNode<{ grandchild: IInvalidNode<{ greatGrandchild: IInvalidNode }> }>
            >();
        });

        it("should return correct node for multi-level paths", () => {
            expectTypeOf<IInvalidNodeAtPath<TestNode, ["child2", "grandchild"]>>().toEqualTypeOf<
                IInvalidNode<{ greatGrandchild: IInvalidNode }>
            >();
            expectTypeOf<
                IInvalidNodeAtPath<TestNode, ["child2", "grandchild", "greatGrandchild"]>
            >().toEqualTypeOf<IInvalidNode>();
        });

        it("should work with valid paths and return correct types", () => {
            // Test that valid paths return the expected node types
            expectTypeOf<IInvalidNodeAtPath<TestNode, []>>().toEqualTypeOf<TestNode>();
            expectTypeOf<IInvalidNodeAtPath<TestNode, ["child1"]>>().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<IInvalidNodeAtPath<TestNode, ["child2"]>>().toMatchTypeOf<IInvalidNode>();
        });

        it("should preserve type information through navigation", () => {
            type TypedNode = IInvalidNode<{
                stringChild: IInvalidNode<{ value: IInvalidNode }>;
                numberChild: IInvalidNode<{ count: IInvalidNode }>;
            }>;

            type StringChildType = IInvalidNodeAtPath<TypedNode, ["stringChild"]>;
            type NumberChildType = IInvalidNodeAtPath<TypedNode, ["numberChild"]>;

            expectTypeOf<StringChildType>().toEqualTypeOf<IInvalidNode<{ value: IInvalidNode }>>();
            expectTypeOf<NumberChildType>().toEqualTypeOf<IInvalidNode<{ count: IInvalidNode }>>();
        });
    });

    describe("IValidationContextValue", () => {
        type TestNode = IInvalidNode<{
            child1: IInvalidNode;
            child2: IInvalidNode<{ grandchild: IInvalidNode }>;
        }>;
        type TestContext = IValidationContextValue<TestNode>;

        it("should have rootNode property with correct type", () => {
            expectTypeOf<TestContext["rootNode"]>().toEqualTypeOf<TestNode>();
        });

        it("should have isValid property as boolean", () => {
            expectTypeOf<TestContext["isValid"]>().toEqualTypeOf<boolean>();
        });

        it("should have registerChild method with correct signature", () => {
            expectTypeOf<TestContext["registerChild"]>().toEqualTypeOf<(child: IInvalidNode) => () => void>();
        });

        describe("setInvalidDatapoints method", () => {
            it("should accept setter function and optional path", () => {
                expectTypeOf<TestContext["setInvalidDatapoints"]>().toBeFunction();
                expectTypeOf<TestContext["setInvalidDatapoints"]>().parameter(0).toBeFunction();
                expectTypeOf<TestContext["setInvalidDatapoints"]>()
                    .parameter(1)
                    .toEqualTypeOf<IInvalidNodePath<TestNode> | undefined>();
            });

            it("should have setter function with correct signature for root path", () => {
                type SetterForRoot = Parameters<TestContext["setInvalidDatapoints"]>[0];
                expectTypeOf<SetterForRoot>().parameter(0).toMatchTypeOf<IInvalidNode>();
                expectTypeOf<SetterForRoot>().returns.toEqualTypeOf<
                    Array<IInvalidDatapoint | undefined | null | false>
                >();
            });

            it("should return void", () => {
                expectTypeOf<TestContext["setInvalidDatapoints"]>().returns.toEqualTypeOf<void>();
            });
        });

        describe("getInvalidDatapoints method", () => {
            it("should accept optional arguments object", () => {
                expectTypeOf<TestContext["getInvalidDatapoints"]>().toBeFunction();
                expectTypeOf<TestContext["getInvalidDatapoints"]>().parameter(0).toEqualTypeOf<
                    | {
                          path?: IInvalidNodePath<TestNode>;
                          recursive?: boolean;
                      }
                    | undefined
                >();
            });

            it("should return array of invalid datapoints", () => {
                expectTypeOf<TestContext["getInvalidDatapoints"]>().returns.toEqualTypeOf<
                    IInvalidDatapoint[]
                >();
            });
        });

        it("should work with different node structures", () => {
            type EmptyNode = IInvalidNode<{}>;
            type EmptyContext = IValidationContextValue<EmptyNode>;

            expectTypeOf<EmptyContext["rootNode"]>().toEqualTypeOf<EmptyNode>();
            expectTypeOf<EmptyContext["setInvalidDatapoints"]>()
                .parameter(1)
                .toEqualTypeOf<IInvalidNodePath<EmptyNode> | undefined>();
        });
    });

    describe("Complex type scenarios", () => {
        it("should handle deeply nested structures", () => {
            type DeepNode = IInvalidNode<{
                level1: IInvalidNode<{
                    level2: IInvalidNode<{
                        level3: IInvalidNode<{
                            level4: IInvalidNode;
                        }>;
                    }>;
                }>;
            }>;

            expectTypeOf<
                IInvalidNodeAtPath<DeepNode, ["level1", "level2", "level3", "level4"]>
            >().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<["level1", "level2", "level3", "level4"]>().toMatchTypeOf<
                IInvalidNodePath<DeepNode>
            >();
        });

        it("should handle mixed child types", () => {
            type MixedNode = IInvalidNode<{
                simpleChild: IInvalidNode;
                complexChild: IInvalidNode<{
                    nested1: IInvalidNode;
                    nested2: IInvalidNode<{ deepNested: IInvalidNode }>;
                }>;
                emptyChild: IInvalidNode<{}>;
            }>;

            expectTypeOf<IInvalidNodeAtPath<MixedNode, ["simpleChild"]>>().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<
                IInvalidNodeAtPath<MixedNode, ["complexChild", "nested1"]>
            >().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<
                IInvalidNodeAtPath<MixedNode, ["complexChild", "nested2", "deepNested"]>
            >().toEqualTypeOf<IInvalidNode>();
            expectTypeOf<IInvalidNodeAtPath<MixedNode, ["emptyChild"]>>().toEqualTypeOf<IInvalidNode<{}>>();
        });

        it("should maintain type safety across operations", () => {
            type SafetyTestNode = IInvalidNode<{
                branch1: IInvalidNode<{ leaf: IInvalidNode }>;
                branch2: IInvalidNode<{ leaf: IInvalidNode }>;
            }>;

            // Verify that paths are type-safe
            expectTypeOf<["branch1", "leaf"]>().toMatchTypeOf<IInvalidNodePath<SafetyTestNode>>();
            expectTypeOf<["branch2", "leaf"]>().toMatchTypeOf<IInvalidNodePath<SafetyTestNode>>();

            // Verify that invalid paths are rejected
            expectTypeOf<["invalidBranch", "leaf"]>().not.toMatchTypeOf<IInvalidNodePath<SafetyTestNode>>();
        });

        it("should handle edge cases gracefully", () => {
            // Single child node
            type SingleChildNode = IInvalidNode<{ onlyChild: IInvalidNode }>;
            expectTypeOf<IInvalidNodeAtPath<SingleChildNode, ["onlyChild"]>>().toEqualTypeOf<IInvalidNode>();

            // Node with many children
            type ManyChildrenNode = IInvalidNode<{
                child1: IInvalidNode;
                child2: IInvalidNode;
                child3: IInvalidNode;
                child4: IInvalidNode;
                child5: IInvalidNode;
            }>;
            expectTypeOf<["child3"]>().toMatchTypeOf<IInvalidNodePath<ManyChildrenNode>>();
            expectTypeOf<IInvalidNodeAtPath<ManyChildrenNode, ["child5"]>>().toEqualTypeOf<IInvalidNode>();
        });
    });
});
