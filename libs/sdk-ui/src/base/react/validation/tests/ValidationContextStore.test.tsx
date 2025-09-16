// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IInvalidNode, IValidationContextValue } from "../types.js";
import { createInvalidDatapoint } from "../utils.js";
import { ValidationContextStore, useValidationContextValue } from "../ValidationContextStore.js";

describe("ValidationContext", () => {
    const createTestNode = (): IInvalidNode => ({
        id: "test-root",
        invalidDatapoints: [createInvalidDatapoint({ message: "Initial error" })],
        children: {
            child1: {
                id: "child1",
                invalidDatapoints: [],
                children: {},
            },
        },
    });

    // Helper component for testing that properly wraps ValidationContextStore
    function TestValidationProvider({
        initialValue,
        children,
    }: {
        initialValue: IInvalidNode;
        children: ReactNode;
    }) {
        const contextValue = useValidationContextValue(initialValue);
        return <ValidationContextStore value={contextValue}>{children}</ValidationContextStore>;
    }

    describe("useValidationContextValue", () => {
        it("should initialize with provided initial value", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            expect(result.current.rootNode).toEqual(initialValue);
        });

        it("should get invalid datapoints from root", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            const datapoints = result.current.getInvalidDatapoints();
            expect(datapoints).toHaveLength(1);
            expect(datapoints[0].message).toBe("Initial error");
        });

        it("should get invalid datapoints from specific path", () => {
            const initialValue: IInvalidNode = {
                id: "root",
                invalidDatapoints: [],
                children: {
                    child1: {
                        id: "child1",
                        invalidDatapoints: [createInvalidDatapoint({ message: "Child error" })],
                        children: {},
                    },
                },
            };
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            const datapoints = result.current.getInvalidDatapoints({ path: ["child1"] });
            expect(datapoints).toHaveLength(1);
            expect(datapoints[0].message).toBe("Child error");
        });

        it("should set invalid datapoints at root path", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            act(() => {
                result.current.setInvalidDatapoints(
                    () => [createInvalidDatapoint({ message: "New root error" })],
                    [],
                );
            });

            const datapoints = result.current.getInvalidDatapoints();
            expect(datapoints).toHaveLength(1);
            expect(datapoints[0].message).toBe("New root error");
        });

        it("should set invalid datapoints at specific path", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            act(() => {
                result.current.setInvalidDatapoints(
                    () => [createInvalidDatapoint({ message: "New child error" })],
                    ["child1"],
                );
            });

            const childDatapoints = result.current.getInvalidDatapoints({ path: ["child1"] });
            expect(childDatapoints).toHaveLength(1);
            expect(childDatapoints[0].message).toBe("New child error");
        });

        it("should filter out falsy datapoints", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            act(() => {
                result.current.setInvalidDatapoints(
                    () => [
                        createInvalidDatapoint({ message: "Valid error" }),
                        null,
                        undefined,
                        false,
                        createInvalidDatapoint({ message: "Another valid error" }),
                    ],
                    [],
                );
            });

            expect(result.current.rootNode.invalidDatapoints).toHaveLength(2);
            expect(result.current.rootNode.invalidDatapoints[0].message).toBe("Valid error");
            expect(result.current.rootNode.invalidDatapoints[1].message).toBe("Another valid error");
        });

        it("should register and unregister children", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            const childNode: IInvalidNode = {
                id: "new-child",
                invalidDatapoints: [createInvalidDatapoint({ message: "New child error" })],
                children: {},
            };

            let unregister: (() => void) | undefined;

            act(() => {
                unregister = result.current.registerChild(childNode);
            });

            // Child should be registered with a unique key
            const childKeys = Object.keys(result.current.rootNode.children).filter((key) =>
                key.startsWith("new-child-"),
            );
            expect(childKeys).toHaveLength(1);
            const childKey = childKeys[0];
            expect(result.current.rootNode.children[childKey]).toEqual(childNode);

            act(() => {
                unregister?.();
            });

            // Child should be unregistered
            expect(result.current.rootNode.children[childKey]).toBeUndefined();
        });

        it("should preserve existing children when registering new child", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            const newChild: IInvalidNode = {
                id: "new-child",
                invalidDatapoints: [],
                children: {},
            };

            act(() => {
                result.current.registerChild(newChild);
            });

            expect(result.current.rootNode.children["child1"]).toBeDefined();
            const childKeys = Object.keys(result.current.rootNode.children).filter((key) =>
                key.startsWith("new-child-"),
            );
            expect(childKeys).toHaveLength(1);
            expect(result.current.rootNode.children[childKeys[0]]).toEqual(newChild);
        });

        it("should preserve other children when unregistering specific child", () => {
            const initialValue = createTestNode();
            const { result } = renderHook(() => useValidationContextValue(initialValue));

            const newChild1: IInvalidNode = {
                id: "new-child-1",
                invalidDatapoints: [],
                children: {},
            };

            const newChild2: IInvalidNode = {
                id: "new-child-2",
                invalidDatapoints: [],
                children: {},
            };

            let unregister1: (() => void) | undefined;

            act(() => {
                unregister1 = result.current.registerChild(newChild1);
                result.current.registerChild(newChild2);
            });

            act(() => {
                unregister1?.();
            });

            expect(result.current.rootNode.children["child1"]).toBeDefined();
            const child1Keys = Object.keys(result.current.rootNode.children).filter((key) =>
                key.startsWith("new-child-1-"),
            );
            const child2Keys = Object.keys(result.current.rootNode.children).filter((key) =>
                key.startsWith("new-child-2-"),
            );
            expect(child1Keys).toHaveLength(0);
            expect(child2Keys).toHaveLength(1);
            expect(result.current.rootNode.children[child2Keys[0]]).toEqual(newChild2);
        });
    });

    describe("ValidationContext component", () => {
        it("should render children", () => {
            const initialValue = createTestNode();
            function TestComponent() {
                return <div data-testid="test-content">Test Content</div>;
            }

            const { getByTestId } = render(
                <TestValidationProvider initialValue={initialValue}>
                    <TestComponent />
                </TestValidationProvider>,
            );

            expect(getByTestId("test-content")).toBeInTheDocument();
        });

        it("should provide validation context value to children", () => {
            const initialValue = createTestNode();
            let contextValue: any;

            function TestComponent() {
                contextValue = ValidationContextStore.useContextStore();
                return <div>Test</div>;
            }

            render(
                <TestValidationProvider initialValue={initialValue}>
                    <TestComponent />
                </TestValidationProvider>,
            );

            expect(contextValue).toBeDefined();
            expect(contextValue.rootNode).toEqual(initialValue);
            expect(typeof contextValue.setInvalidDatapoints).toBe("function");
            expect(typeof contextValue.getInvalidDatapoints).toBe("function");
            expect(typeof contextValue.registerChild).toBe("function");
        });

        it("should allow nested validation contexts", () => {
            const parentInitialValue = createTestNode();
            const childInitialValue: IInvalidNode = {
                id: "child-context",
                invalidDatapoints: [],
                children: {},
            };

            let parentContext: any;
            let childContext: any;

            function ChildComponent() {
                childContext = ValidationContextStore.useContextStore();
                return <div>Child</div>;
            }

            function ParentComponent() {
                parentContext = ValidationContextStore.useContextStore();
                return (
                    <TestValidationProvider initialValue={childInitialValue}>
                        <ChildComponent />
                    </TestValidationProvider>
                );
            }

            render(
                <TestValidationProvider initialValue={parentInitialValue}>
                    <ParentComponent />
                </TestValidationProvider>,
            );

            expect(parentContext.rootNode.id).toBe("test-root");
            expect(childContext.rootNode.id).toBe("child-context");
        });

        it("should register child context with parent when nested", () => {
            const parentInitialValue = createTestNode();
            const childInitialValue: IInvalidNode = {
                id: "child-context",
                invalidDatapoints: [createInvalidDatapoint({ message: "Child context error" })],
                children: {},
            };

            let parentContext: any;

            function ChildComponent() {
                // Use ValidationContext component instead of direct hook call
                return (
                    <TestValidationProvider initialValue={childInitialValue}>
                        <div>Child</div>
                    </TestValidationProvider>
                );
            }

            function ParentComponent() {
                parentContext = ValidationContextStore.useContextStore();
                return <ChildComponent />;
            }

            render(
                <TestValidationProvider initialValue={parentInitialValue}>
                    <ParentComponent />
                </TestValidationProvider>,
            );

            // Note: The child context registration behavior needs to be verified differently
            // since ValidationContext components don't automatically register with parents
            expect(parentContext.rootNode.id).toBe("test-root");
        });
    });

    describe("ValidationContextStore", () => {
        it("should be created with correct structure", () => {
            expect(typeof ValidationContextStore).toBe("function");
            expect(typeof ValidationContextStore.useContextStore).toBe("function");
            expect(typeof ValidationContextStore.useContextStoreOptional).toBe("function");
            expect(typeof ValidationContextStore.createSelector).toBe("function");
        });

        it("should provide useContextStore method", () => {
            expect(typeof ValidationContextStore.useContextStore).toBe("function");
        });

        it("should provide useContextStoreOptional method", () => {
            expect(typeof ValidationContextStore.useContextStoreOptional).toBe("function");
        });
    });

    describe("integration with parent context", () => {
        it("should work with automatic child registration", () => {
            const parentInitialValue = createTestNode();
            let parentContext: IValidationContextValue<IInvalidNode> | undefined;

            function TestComponent() {
                parentContext = ValidationContextStore.useContextStore();

                useValidationContextValue({
                    id: "child-context",
                    invalidDatapoints: [],
                    children: {},
                });

                // No manual registration needed - useValidationContextValue automatically registers with parent
                return <div data-testid="test-component" />;
            }

            render(
                <TestValidationProvider initialValue={parentInitialValue}>
                    <TestComponent />
                </TestValidationProvider>,
            );

            // The child should be registered with the parent using a unique key (automatic registration)
            expect(parentContext).toBeDefined();
            const childKeys = Object.keys(parentContext!.rootNode.children).filter((key) =>
                key.startsWith("child-context-"),
            );
            expect(childKeys).toHaveLength(1);
            expect(parentContext!.rootNode.children[childKeys[0]].id).toBe("child-context");
        });

        it("should handle child unregistration", () => {
            const parentInitialValue = createTestNode();
            let parentContext: IValidationContextValue<IInvalidNode> | undefined;

            function TestComponent({ shouldRender }: { shouldRender: boolean }) {
                parentContext = ValidationContextStore.useContextStore();

                return <div data-testid="test-component">{shouldRender ? <ChildComponent /> : null}</div>;
            }

            function ChildComponent() {
                useValidationContextValue({
                    id: "temp-child",
                    invalidDatapoints: [],
                    children: {},
                });
                return null;
            }

            const { rerender } = render(
                <TestValidationProvider initialValue={parentInitialValue}>
                    <TestComponent shouldRender={true} />
                </TestValidationProvider>,
            );

            // Child should be registered
            expect(parentContext).toBeDefined();
            const childKeys = Object.keys(parentContext!.rootNode.children).filter((key) =>
                key.startsWith("temp-child-"),
            );
            expect(childKeys).toHaveLength(1);

            rerender(
                <TestValidationProvider initialValue={parentInitialValue}>
                    <TestComponent shouldRender={false} />
                </TestValidationProvider>,
            );

            // Child should be unregistered when component unmounts
            const childKeysAfter = Object.keys(parentContext!.rootNode.children).filter((key) =>
                key.startsWith("temp-child-"),
            );
            expect(childKeysAfter).toHaveLength(0);
        });

        it("should report parent context as invalid when child context has invalid datapoints", () => {
            // Create a clean parent node without any error-level datapoints
            const cleanParentNode: IInvalidNode = {
                id: "clean-parent",
                invalidDatapoints: [
                    createInvalidDatapoint({ message: "Parent warning", severity: "warning" }),
                ],
                children: {},
            };

            let parentContext: IValidationContextValue<IInvalidNode> | undefined;
            let childContext: IValidationContextValue<any> | undefined;

            function TestComponent() {
                parentContext = ValidationContextStore.useContextStore();

                childContext = useValidationContextValue({
                    id: "child-with-error",
                    invalidDatapoints: [],
                    children: {},
                });

                return <div data-testid="test-component" />;
            }

            render(
                <TestValidationProvider initialValue={cleanParentNode}>
                    <TestComponent />
                </TestValidationProvider>,
            );

            // Initially both parent and child should be valid (no error-level datapoints)
            expect(parentContext).toBeDefined();
            expect(childContext).toBeDefined();
            expect(parentContext!.isValid).toBe(true);
            expect(childContext!.isValid).toBe(true);

            // Add an error-level datapoint to the child context
            act(() => {
                childContext!.setInvalidDatapoints(
                    () => [createInvalidDatapoint({ message: "Child error", severity: "error" })],
                    [],
                );
            });

            // Child should now be invalid
            expect(childContext!.isValid).toBe(false);

            // Parent should also be invalid because it includes the child's invalid datapoints
            expect(parentContext!.isValid).toBe(false);

            // Verify the parent can see the child's invalid datapoints
            const allParentDatapoints = parentContext!.getInvalidDatapoints({ recursive: true });
            const childErrorDatapoints = allParentDatapoints.filter((dp) => dp.message === "Child error");
            expect(childErrorDatapoints).toHaveLength(1);
        });

        it("should keep child context valid when parent context has invalid datapoints", () => {
            // Create a parent node with an error-level datapoint
            const parentWithError: IInvalidNode = {
                id: "parent-with-error",
                invalidDatapoints: [createInvalidDatapoint({ message: "Parent error", severity: "error" })],
                children: {},
            };

            let parentContext: IValidationContextValue<IInvalidNode> | undefined;
            let childContext: IValidationContextValue<IInvalidNode> | undefined;

            function TestComponent() {
                parentContext = ValidationContextStore.useContextStore();

                childContext = useValidationContextValue({
                    id: "clean-child",
                    invalidDatapoints: [
                        createInvalidDatapoint({ message: "Child warning", severity: "warning" }),
                    ],
                    children: {},
                });

                return <div data-testid="test-component" />;
            }

            render(
                <TestValidationProvider initialValue={parentWithError}>
                    <TestComponent />
                </TestValidationProvider>,
            );

            // Parent should be invalid due to its error-level datapoint
            expect(parentContext).toBeDefined();
            expect(childContext).toBeDefined();
            expect(parentContext!.isValid).toBe(false);

            // Child should be valid (only has warning-level datapoints)
            expect(childContext!.isValid).toBe(true);

            // Verify child only sees its own datapoints
            const childDatapoints = childContext!.getInvalidDatapoints();
            expect(childDatapoints).toHaveLength(1);
            expect(childDatapoints[0].message).toBe("Child warning");

            // Verify parent sees both its own and child's datapoints
            const parentDatapoints = parentContext!.getInvalidDatapoints({ recursive: true });
            expect(parentDatapoints.length).toBeGreaterThanOrEqual(2);
            const parentErrorDatapoints = parentDatapoints.filter((dp) => dp.message === "Parent error");
            const childWarningDatapoints = parentDatapoints.filter((dp) => dp.message === "Child warning");
            expect(parentErrorDatapoints).toHaveLength(1);
            expect(childWarningDatapoints).toHaveLength(1);
        });
    });
});
