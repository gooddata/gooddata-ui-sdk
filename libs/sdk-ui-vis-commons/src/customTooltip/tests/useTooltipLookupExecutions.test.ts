// (C) 2026 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";

import { type ITooltipExecutionBundle, type ITooltipExecutionMeta } from "../tooltipExecution.js";
import { type IResolvedReferenceValues } from "../types.js";
import {
    type ITooltipLookupExecutionEntry,
    useTooltipLookup,
    useTooltipLookupExecutions,
} from "../useTooltipLookupExecutions.js";

// `buildLookupTable` consumes a `DataViewFacade`-shaped object; we don't care
// about its internals in these tests — only that the hook calls it once per
// entry and routes the result through. The fake dataView only needs to be
// referentially distinct so the assertions can identify which entry produced it.
vi.mock("../tooltipLookup.js", () => ({
    buildLookupTable: vi.fn((dataView: { key: string }) => {
        const map = new Map<string, IResolvedReferenceValues>();
        map.set(`lookup-for-${dataView.key}`, { "metric/x": dataView.key });
        return map;
    }),
}));

const META: ITooltipExecutionMeta = {
    labelCountMap: {},
    measureIdMap: {},
    labelIdMap: {},
};

function makeBundle(fingerprint: string, dataViewKey = fingerprint): ITooltipExecutionBundle {
    return { execution: makeExecution(fingerprint, dataViewKey), meta: META };
}

function makeExecution(fingerprint: string, dataViewKey: string): IPreparedExecution {
    return {
        fingerprint: () => fingerprint,
        execute: () =>
            Promise.resolve({
                readAll: () => Promise.resolve({ key: dataViewKey } as unknown as IDataView),
            }),
    } as unknown as IPreparedExecution;
}

function makeRejectingExecution(fingerprint: string): IPreparedExecution {
    return {
        fingerprint: () => fingerprint,
        execute: () => Promise.reject(new Error("boom")),
    } as unknown as IPreparedExecution;
}

function makeEntry<TContext>(
    key: string,
    execution: IPreparedExecution,
    context: TContext,
): ITooltipLookupExecutionEntry<TContext> {
    return { key, execution, meta: META, context };
}

describe("useTooltipLookup", () => {
    it("returns undefined when no bundle is provided", () => {
        const { result } = renderHook(() => useTooltipLookup(undefined));
        expect(result.current).toBeUndefined();
    });

    it("resolves to a lookup map once the execution completes", async () => {
        const bundle = makeBundle("fp1");
        const { result } = renderHook(() => useTooltipLookup(bundle));

        expect(result.current).toBeUndefined();
        await waitFor(() => {
            expect(result.current).toBeDefined();
        });
        expect(result.current?.get("lookup-for-fp1")).toEqual({ "metric/x": "fp1" });
    });

    it("re-executes when the fingerprint changes", async () => {
        const bundleA = makeBundle("fp-a");
        const { result, rerender } = renderHook(
            ({ b }: { b: ITooltipExecutionBundle }) => useTooltipLookup(b),
            {
                initialProps: { b: bundleA },
            },
        );
        await waitFor(() => expect(result.current?.get("lookup-for-fp-a")).toBeDefined());

        const bundleB = makeBundle("fp-b");
        rerender({ b: bundleB });
        await waitFor(() => expect(result.current?.get("lookup-for-fp-b")).toBeDefined());
        expect(result.current?.get("lookup-for-fp-a")).toBeUndefined();
    });

    it("does not re-execute when only the bundle identity changes (same fingerprint)", async () => {
        const executeSpy = vi.fn(() =>
            Promise.resolve({
                readAll: () => Promise.resolve({ key: "stable" } as unknown as IDataView),
            }),
        );
        const makeStable = (): ITooltipExecutionBundle => ({
            execution: {
                fingerprint: () => "stable-fp",
                execute: executeSpy,
            } as unknown as IPreparedExecution,
            meta: META,
        });

        const { result, rerender } = renderHook(
            ({ b }: { b: ITooltipExecutionBundle }) => useTooltipLookup(b),
            { initialProps: { b: makeStable() } },
        );
        await waitFor(() => expect(result.current).toBeDefined());
        expect(executeSpy).toHaveBeenCalledTimes(1);

        rerender({ b: makeStable() });
        await act(async () => {});
        expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it("returns undefined again when the bundle is cleared", async () => {
        const { result, rerender } = renderHook(
            ({ b }: { b: ITooltipExecutionBundle | undefined }) => useTooltipLookup(b),
            { initialProps: { b: makeBundle("fp1") } as { b: ITooltipExecutionBundle | undefined } },
        );
        await waitFor(() => expect(result.current).toBeDefined());

        rerender({ b: undefined });
        await waitFor(() => expect(result.current).toBeUndefined());
    });
});

describe("useTooltipLookupExecutions", () => {
    it("returns an empty (stable) map when no entries are provided", () => {
        const { result, rerender } = renderHook(() => useTooltipLookupExecutions<string>([]));
        const first = result.current;
        expect(first.size).toBe(0);

        rerender();
        // Stable identity matters for downstream useMemo deps.
        expect(result.current).toBe(first);
    });

    it("executes all entries and keys the result by entry key", async () => {
        const entries = [
            makeEntry("layer-1", makeExecution("fp-1", "fp-1"), "ctx-1"),
            makeEntry("layer-2", makeExecution("fp-2", "fp-2"), "ctx-2"),
        ];
        const { result } = renderHook(() => useTooltipLookupExecutions(entries));

        await waitFor(() => expect(result.current.size).toBe(2));
        expect(result.current.get("layer-1")?.lookup.get("lookup-for-fp-1")).toEqual({ "metric/x": "fp-1" });
        expect(result.current.get("layer-2")?.lookup.get("lookup-for-fp-2")).toEqual({ "metric/x": "fp-2" });
    });

    it("plumbs context through to the result entries", async () => {
        const fnCtx = (x: number) => x + 1;
        const entries = [makeEntry("layer-1", makeExecution("fp-1", "fp-1"), fnCtx)];

        const { result } = renderHook(() => useTooltipLookupExecutions(entries));
        await waitFor(() => expect(result.current.size).toBe(1));

        expect(result.current.get("layer-1")?.context).toBe(fnCtx);
    });

    it("drops failed entries silently (Promise.allSettled), keeps successful ones", async () => {
        const entries = [
            makeEntry("ok", makeExecution("fp-ok", "fp-ok"), "ctx-ok"),
            makeEntry("fail", makeRejectingExecution("fp-fail"), "ctx-fail"),
        ];
        const { result } = renderHook(() => useTooltipLookupExecutions(entries));

        await waitFor(() => expect(result.current.size).toBe(1));
        expect(result.current.get("ok")).toBeDefined();
        expect(result.current.get("fail")).toBeUndefined();
    });

    it("re-fires when any entry's fingerprint changes", async () => {
        const { result, rerender } = renderHook(
            ({ entries }: { entries: ITooltipLookupExecutionEntry<string>[] }) =>
                useTooltipLookupExecutions(entries),
            {
                initialProps: {
                    entries: [makeEntry("layer-1", makeExecution("v1", "v1"), "ctx")],
                },
            },
        );
        await waitFor(() => expect(result.current.get("layer-1")?.lookup.get("lookup-for-v1")).toBeDefined());

        rerender({
            entries: [makeEntry("layer-1", makeExecution("v2", "v2"), "ctx")],
        });
        await waitFor(() => expect(result.current.get("layer-1")?.lookup.get("lookup-for-v2")).toBeDefined());
    });
});
