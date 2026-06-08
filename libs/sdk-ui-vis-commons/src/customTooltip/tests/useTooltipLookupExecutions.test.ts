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
    return { key, execution: makeTooltipExecution(makeBundle(execution)), context };
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
        expect(result.current?.get("lookup-for-fp1")).toEqual({
            "metric/x": { kind: "value", text: "fp1" },
        });
    });

    it("re-executes when the batch fingerprint changes", async () => {
        const { result, rerender } = renderHook(({ e }: { e: ITooltipExecution }) => useTooltipLookup(e), {
            initialProps: { e: makeTooltipExecution(makeBundle(makeExecution("fp-a"))) },
        });
        await waitFor(() => expect(result.current?.get("lookup-for-fp-a")).toBeDefined());

        rerender({ e: makeTooltipExecution(makeBundle(makeExecution("fp-b"))) });
        await waitFor(() => expect(result.current?.get("lookup-for-fp-b")).toBeDefined());
        expect(result.current?.get("lookup-for-fp-a")).toBeUndefined();
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

    it("isolates a failed reference via fan-out: the good one resolves, the bad one is absent", async () => {
        // Batch fails (e.g. one invalid ref 400s the whole AFM). Fan-out runs
        // each reference alone: the good one resolves into the lookup; the bad
        // one is left out — no parsing of the backend error needed.
        const execution = makeTooltipExecution(makeBundle(makeRejectingExecution("batch-fp")), [
            makeBundle(makeExecution("good"), metaWith({ tt_m_0: "good" })),
            makeBundle(makeRejectingExecution("bad-fp"), metaWith({ tt_m_0: "bad" })),
        ]);
        const { result } = renderHook(() => useTooltipLookup(execution));

        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.get("lookup-for-good")).toEqual({
            "metric/x": { kind: "value", text: "good" },
        });
        // The bad ref's bundle rejected, so it never enters the lookup; at render
        // it falls to the unresolved default ("(Data could not be retrieved)").
        expect(result.current?.get("lookup-for-bad")).toBeUndefined();
    });

    it("produces an empty lookup when the batch and all fan-out executions fail", async () => {
        const execution = makeTooltipExecution(makeBundle(makeRejectingExecution("batch-fp")), [
            makeBundle(makeRejectingExecution("f1"), metaWith({ tt_m_0: "a" })),
            makeBundle(makeRejectingExecution("f2"), metaWith({ tt_m_0: "b" })),
        ]);
        const { result } = renderHook(() => useTooltipLookup(execution));

        await waitFor(() => expect(result.current).toBeDefined());
        // Nothing resolved → empty lookup; every ref renders the unresolved default.
        expect(result.current?.size).toBe(0);
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
        expect(result.current?.get("pt-1")).toEqual({
            "metric/a": { kind: "value", text: "a" },
            "metric/b": { kind: "value", text: "b" },
        });
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

    it("fans out per reference within an entry when its batch fails", async () => {
        // Per-layer isolation: a layer whose batch fails no longer drops out —
        // it fans out per reference, so the good ref resolves and the bad one is
        // left out, just like the single-execution variant.
        const entries: ITooltipLookupExecutionEntry<string>[] = [
            {
                key: "layer-1",
                execution: makeTooltipExecution(makeBundle(makeRejectingExecution("batch")), [
                    makeBundle(makeExecution("good"), metaWith({ tt_m_0: "good" })),
                    makeBundle(makeRejectingExecution("bad"), metaWith({ tt_m_0: "bad" })),
                ]),
                context: "ctx",
            },
        ];
        const { result } = renderHook(() => useTooltipLookupExecutions(entries));

        await waitFor(() => expect(result.current.size).toBe(1));
        const entry = result.current.get("layer-1");
        expect(entry?.lookup.get("lookup-for-good")).toEqual({ "metric/x": { kind: "value", text: "good" } });
        expect(entry?.lookup.get("lookup-for-bad")).toBeUndefined();
    });

    it("isolates fan-out per layer: one layer fans out while another resolves cleanly", async () => {
        const entries: ITooltipLookupExecutionEntry<string>[] = [
            {
                key: "layer-a",
                execution: makeTooltipExecution(makeBundle(makeRejectingExecution("a-batch")), [
                    makeBundle(makeRejectingExecution("a-bad"), metaWith({ tt_m_0: "a-bad" })),
                ]),
                context: "ctx-a",
            },
            {
                key: "layer-b",
                execution: makeTooltipExecution(makeBundle(makeExecution("b"))),
                context: "ctx-b",
            },
        ];
        const { result } = renderHook(() => useTooltipLookupExecutions(entries));

        await waitFor(() => expect(result.current.size).toBe(2));
        // Layer A's batch failed and its only ref is bad → empty lookup; layer B is untouched.
        expect(result.current.get("layer-a")?.lookup.size).toBe(0);
        expect(result.current.get("layer-b")?.lookup.get("lookup-for-b")).toBeDefined();
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
