// (C) 2025 GoodData Corporation
import React from "react";

import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createContextStore } from "../contextStore.js";

describe("contextStore", () => {
    interface TestState {
        count: number;
        name: string;
        callback: () => void;
        nested: {
            value: string;
            fn: (x: number) => number;
        };
    }

    const initialState: TestState = {
        count: 0,
        name: "test",
        callback: vi.fn(),
        nested: {
            value: "nested",
            fn: (x: number) => x * 2,
        },
    };

    it("should create a context store with Provider and hooks", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        expect(TestStore).toBeDefined();
        expect(typeof TestStore).toBe("function"); // Provider is a function component
        expect(TestStore.useContextStore).toBeDefined();
        expect(TestStore.useContextStoreOptional).toBeDefined();
        expect(TestStore.createSelector).toBeDefined();
    });

    it("should provide state through Provider and useContextStore", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        const { result } = renderHook(() => TestStore.useContextStore(), { wrapper });

        expect(result.current).toEqual(initialState);
    });

    it("should throw error when useContextStore is used outside Provider", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        expect(() => {
            renderHook(() => TestStore.useContextStore());
        }).toThrow("Context store 'TestStore' must be used within a Provider");
    });

    it("should return undefined when useContextStoreOptional is used outside Provider", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const { result } = renderHook(() => TestStore.useContextStoreOptional());

        expect(result.current).toBeUndefined();
    });

    it("should select slice of state with selector", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        const { result } = renderHook(() => TestStore.useContextStore((state) => state.count), { wrapper });

        expect(result.current).toBe(0);
    });

    it("should select function from state with selector", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        const { result } = renderHook(() => TestStore.useContextStore((state) => state.callback), {
            wrapper,
        });

        expect(result.current).toBe(initialState.callback);
        expect(typeof result.current).toBe("function");
    });

    it("should select nested function from state with selector", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        const { result } = renderHook(() => TestStore.useContextStore((state) => state.nested.fn), {
            wrapper,
        });

        expect(result.current).toBe(initialState.nested.fn);
        expect(typeof result.current).toBe("function");
        expect(result.current(5)).toBe(10);
    });

    it("should update state when Provider value changes", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const Consumer = () => {
            const count = TestStore.useContextStore((s) => s.count);
            return <div data-testid="consumer">{count}</div>;
        };

        const TestComponent = ({ state }: { state: TestState }) => (
            <TestStore value={state}>
                <Consumer />
            </TestStore>
        );

        const { rerender, getByTestId } = render(<TestComponent state={initialState} />);

        expect(getByTestId("consumer")).toHaveTextContent("0");

        const newState = { ...initialState, count: 5 };
        rerender(<TestComponent state={newState} />);

        expect(getByTestId("consumer")).toHaveTextContent("5");
    });

    it("should only rerender when selected slice changes", () => {
        const TestStore = createContextStore<TestState>("TestStore");
        const renderSpy = vi.fn();

        const TestComponent = () => {
            const count = TestStore.useContextStore((s) => s.count);
            renderSpy();
            return <div data-testid="count">{count}</div>;
        };

        const Wrapper = ({ state }: { state: TestState }) => (
            <TestStore value={state}>
                <TestComponent />
            </TestStore>
        );

        const { rerender, getByTestId } = render(<Wrapper state={initialState} />);

        renderSpy.mockClear(); // Clear initial render calls
        expect(getByTestId("count")).toHaveTextContent("0");

        // Change name but not count - should not cause additional renders
        const newState1 = { ...initialState, name: "changed" };
        rerender(<Wrapper state={newState1} />);

        const renderCountAfterNameChange = renderSpy.mock.calls.length;

        // Change count - should cause additional render
        const newState2 = { ...newState1, count: 10 };
        rerender(<Wrapper state={newState2} />);

        expect(renderSpy.mock.calls.length).toBeGreaterThan(renderCountAfterNameChange);
        expect(getByTestId("count")).toHaveTextContent("10");
    });

    it("should work with custom equality function", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        // Custom equality that always returns true (never update)
        const alwaysEqual = () => true;

        const { result } = renderHook(() => TestStore.useContextStore((state) => state.count, alwaysEqual), {
            wrapper,
        });

        expect(result.current).toBe(0);
    });

    it("should handle function selector with equality comparison", () => {
        const TestStore = createContextStore<TestState>("TestStore");
        const renderSpy = vi.fn();

        const TestComponent = () => {
            const callback = TestStore.useContextStore((s) => s.callback);
            renderSpy();
            return <div data-testid="callback">{typeof callback}</div>;
        };

        const Wrapper = ({ state }: { state: TestState }) => (
            <TestStore value={state}>
                <TestComponent />
            </TestStore>
        );

        const { rerender, getByTestId } = render(<Wrapper state={initialState} />);

        renderSpy.mockClear(); // Clear initial render calls
        expect(getByTestId("callback")).toHaveTextContent("function");

        // Change callback to a different function - should rerender
        const newCallback = vi.fn();
        const newState = { ...initialState, callback: newCallback };
        rerender(<Wrapper state={newState} />);

        expect(renderSpy.mock.calls.length).toBeGreaterThan(0); // Should rerender because function reference changed
    });

    it("should work with createSelector", () => {
        const TestStore = createContextStore<TestState>("TestStore");

        const countSelector = TestStore.createSelector((state) => state.count);
        const callbackSelector = TestStore.createSelector((state) => state.callback);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TestStore value={initialState}>{children}</TestStore>
        );

        const { result: countResult } = renderHook(() => TestStore.useContextStore(countSelector), {
            wrapper,
        });

        const { result: callbackResult } = renderHook(() => TestStore.useContextStore(callbackSelector), {
            wrapper,
        });

        expect(countResult.current).toBe(0);
        expect(callbackResult.current).toBe(initialState.callback);
        expect(typeof callbackResult.current).toBe("function");
    });

    it("should handle complex function selector scenarios", () => {
        interface ComplexState {
            handlers: {
                onClick: (id: string) => void;
                onSubmit: (data: any) => Promise<void>;
            };
            utils: {
                formatter: (value: number) => string;
                validator: (input: string) => boolean;
            };
        }

        const complexState: ComplexState = {
            handlers: {
                onClick: vi.fn(),
                onSubmit: vi.fn().mockResolvedValue(undefined),
            },
            utils: {
                formatter: (value: number) => `$${value.toFixed(2)}`,
                validator: (input: string) => input.length > 0,
            },
        };

        const ComplexStore = createContextStore<ComplexState>("ComplexStore");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ComplexStore value={complexState}>{children}</ComplexStore>
        );

        // Test selecting handler functions
        const { result: onClickResult } = renderHook(
            () => ComplexStore.useContextStore((state) => state.handlers.onClick),
            { wrapper },
        );

        const { result: onSubmitResult } = renderHook(
            () => ComplexStore.useContextStore((state) => state.handlers.onSubmit),
            { wrapper },
        );

        // Test selecting utility functions
        const { result: formatterResult } = renderHook(
            () => ComplexStore.useContextStore((state) => state.utils.formatter),
            { wrapper },
        );

        const { result: validatorResult } = renderHook(
            () => ComplexStore.useContextStore((state) => state.utils.validator),
            { wrapper },
        );

        expect(typeof onClickResult.current).toBe("function");
        expect(typeof onSubmitResult.current).toBe("function");
        expect(typeof formatterResult.current).toBe("function");
        expect(typeof validatorResult.current).toBe("function");

        // Test that the functions work correctly
        expect(formatterResult.current(123.456)).toBe("$123.46");
        expect(validatorResult.current("test")).toBe(true);
        expect(validatorResult.current("")).toBe(false);
    });
});
