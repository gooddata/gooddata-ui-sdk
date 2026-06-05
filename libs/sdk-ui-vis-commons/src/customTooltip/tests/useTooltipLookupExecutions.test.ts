// (C) 2026 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";

import {
    type ITooltipExecution,
    type ITooltipExecutionBundle,
    type ITooltipExecutionMeta,
} from "../tooltipExecution.js";
import { buildLookupTable } from "../tooltipLookup.js";
import { type IResolvedReferenceValues } from "../types.js";
import {
    type ITooltipLookupExecutionEntry,
    useTooltipLookup,
    useTooltipLookupExecutions,
} from "../useTooltipLookupExecutions.js";

// `buildLookupTable` is covered by its own tests; here we only need it to be
// called once per dataView and to route a referentially-identifiable result
// through. The fake dataView only needs a distinct `key`.
vi.mock("../tooltipLookup.js", () => ({
    buildLookupTable: vi.fn((dataView: { key: string }) => {
        const map = new Map<string, IResolvedReferenceValues>();
        map.set(`lookup-for-${dataView.key}`, { "metric/x": { kind: "value", text: dataView.key } });
        return map;
    }),
}));

const META: ITooltipExecutionMeta = { labelCountMap: {}, measureIdMap: {}, labelIdMap: {} };

function metaWith(measureIdMap: Record<string, string>): ITooltipExecutionMeta {
    return { labelCountMap: {}, measureIdMap, labelIdMap: {} };
}

function makeExecution(fingerprint: string, dataViewKey = fingerprint): IPreparedExecution {
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

function makeBundle(
    execution: IPreparedExecution,
    meta: ITooltipExecutionMeta = META,
): ITooltipExecutionBundle {
    return { execution, meta };
}

function makeTooltipExecution(
    batch: ITooltipExecutionBundle,
    perRef: ITooltipExecutionBundle[] = [],
): ITooltipExecution {
    return { batch, perRef: () => perRef };
}

function makeEntry<TContext>(
    key: string,
    execution: IPreparedExecution,
    context: TContext,
): ITooltipLookupExecutionEntry<TContext> {
    return { key, execution, meta: META, context };
}

describe("useTooltipLookup", () => {
    it("returns undefined when no execution is provided", () => {
        const { result } = renderHook(() => useTooltipLookup(undefined));
        expect(result.current).toBeUndefined();
    });

    it("resolves to a lookup once the batch execution completes", async () => {
        const execution = makeTooltipExecution(makeBundle(makeExecution("fp1")));
        const { result } = renderHook(() => useTooltipLookup(execution));

        expect(result.current).toBeUndefined();
        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.lookup.get("lookup-for-fp1")).toEqual({
            "metric/x": { kind: "value", text: "fp1" },
        });
        expect(result.current?.erroredRefs.size).toBe(0);
    });

    it("re-executes when the batch fingerprint changes", async () => {
        const { result, rerender } = renderHook(({ e }: { e: ITooltipExecution }) => useTooltipLookup(e), {
            initialProps: { e: makeTooltipExecution(makeBundle(makeExecution("fp-a"))) },
        });
        await waitFor(() => expect(result.current?.lookup.get("lookup-for-fp-a")).toBeDefined());

        rerender({ e: makeTooltipExecution(makeBundle(makeExecution("fp-b"))) });
        await waitFor(() => expect(result.current?.lookup.get("lookup-for-fp-b")).toBeDefined());
        expect(result.current?.lookup.get("lookup-for-fp-a")).toBeUndefined();
    });

    it("does not re-execute when only the execution identity changes (same fingerprint)", async () => {
        const executeSpy = vi.fn(() =>
            Promise.resolve({
                readAll: () => Promise.resolve({ key: "stable" } as unknown as IDataView),
            }),
        );
        const make = (): ITooltipExecution =>
            makeTooltipExecution(
                makeBundle({
                    fingerprint: () => "stable-fp",
                    execute: executeSpy,
                } as unknown as IPreparedExecution),
            );

        const { result, rerender } = renderHook(({ e }: { e: ITooltipExecution }) => useTooltipLookup(e), {
            initialProps: { e: make() },
        });
        await waitFor(() => expect(result.current).toBeDefined());
        expect(executeSpy).toHaveBeenCalledTimes(1);

        rerender({ e: make() });
        await act(async () => {});
        expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it("returns undefined again when the execution is cleared", async () => {
        const { result, rerender } = renderHook(
            ({ e }: { e: ITooltipExecution | undefined }) => useTooltipLookup(e),
            {
                initialProps: { e: makeTooltipExecution(makeBundle(makeExecution("fp1"))) } as {
                    e: ITooltipExecution | undefined;
                },
            },
        );
        await waitFor(() => expect(result.current).toBeDefined());

        rerender({ e: undefined });
        await waitFor(() => expect(result.current).toBeUndefined());
    });

    it("isolates a failed reference via fan-out: others resolve, the bad one is errored", async () => {
        // Batch fails (e.g. one invalid ref 400s the whole AFM). Fan-out runs
        // each reference alone: the good one resolves into the lookup, the bad
        // one is recorded as errored — no parsing of the backend error needed.
        const execution = makeTooltipExecution(makeBundle(makeRejectingExecution("batch-fp")), [
            makeBundle(makeExecution("good"), metaWith({ tt_m_0: "good" })),
            makeBundle(makeRejectingExecution("bad-fp"), metaWith({ tt_m_0: "bad" })),
        ]);
        const { result } = renderHook(() => useTooltipLookup(execution));

        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.lookup.get("lookup-for-good")).toEqual({
            "metric/x": { kind: "value", text: "good" },
        });
        expect(result.current?.erroredRefs.has("metric/bad")).toBe(true);
        expect(result.current?.erroredRefs.has("metric/good")).toBe(false);
    });

    it("errors every reference when the batch and all fan-out executions fail", async () => {
        const execution = makeTooltipExecution(makeBundle(makeRejectingExecution("batch-fp")), [
            makeBundle(makeRejectingExecution("f1"), metaWith({ tt_m_0: "a" })),
            makeBundle(makeRejectingExecution("f2"), metaWith({ tt_m_0: "b" })),
        ]);
        const { result } = renderHook(() => useTooltipLookup(execution));

        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.lookup.size).toBe(0);
        expect(result.current?.erroredRefs.has("metric/a")).toBe(true);
        expect(result.current?.erroredRefs.has("metric/b")).toBe(true);
    });

    it("merges per-reference lookups that resolve to the same point key on fan-out", async () => {
        // Both refs fan out successfully onto the same point; their statuses must
        // combine rather than overwrite.
        vi.mocked(buildLookupTable)
            .mockReturnValueOnce(
                new Map<string, IResolvedReferenceValues>([
                    ["pt-1", { "metric/a": { kind: "value", text: "a" } }],
                ]),
            )
            .mockReturnValueOnce(
                new Map<string, IResolvedReferenceValues>([
                    ["pt-1", { "metric/b": { kind: "value", text: "b" } }],
                ]),
            );
        const execution = makeTooltipExecution(makeBundle(makeRejectingExecution("batch-fp")), [
            makeBundle(makeExecution("a"), metaWith({ tt_m_0: "a" })),
            makeBundle(makeExecution("b"), metaWith({ tt_m_0: "b" })),
        ]);
        const { result } = renderHook(() => useTooltipLookup(execution));

        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.lookup.get("pt-1")).toEqual({
            "metric/a": { kind: "value", text: "a" },
            "metric/b": { kind: "value", text: "b" },
        });
        expect(result.current?.erroredRefs.size).toBe(0);
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
            makeEntry("layer-1", makeExecution("fp-1"), "ctx-1"),
            makeEntry("layer-2", makeExecution("fp-2"), "ctx-2"),
        ];
        const { result } = renderHook(() => useTooltipLookupExecutions(entries));

        await waitFor(() => expect(result.current.size).toBe(2));
        expect(result.current.get("layer-1")?.lookup.get("lookup-for-fp-1")).toEqual({
            "metric/x": { kind: "value", text: "fp-1" },
        });
        expect(result.current.get("layer-2")?.lookup.get("lookup-for-fp-2")).toEqual({
            "metric/x": { kind: "value", text: "fp-2" },
        });
    });

    it("plumbs context through to the result entries", async () => {
        const fnCtx = (x: number) => x + 1;
        const entries = [makeEntry("layer-1", makeExecution("fp-1"), fnCtx)];

        const { result } = renderHook(() => useTooltipLookupExecutions(entries));
        await waitFor(() => expect(result.current.size).toBe(1));

        expect(result.current.get("layer-1")?.context).toBe(fnCtx);
    });

    it("drops failed entries silently (Promise.allSettled), keeps successful ones", async () => {
        const entries = [
            makeEntry("ok", makeExecution("fp-ok"), "ctx-ok"),
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
                    entries: [makeEntry("layer-1", makeExecution("v1"), "ctx")],
                },
            },
        );
        await waitFor(() => expect(result.current.get("layer-1")?.lookup.get("lookup-for-v1")).toBeDefined());

        rerender({
            entries: [makeEntry("layer-1", makeExecution("v2"), "ctx")],
        });
        await waitFor(() => expect(result.current.get("layer-1")?.lookup.get("lookup-for-v2")).toBeDefined());
    });
});
