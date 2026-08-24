// (C) 2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ILoadingInjectedProps, withEntireDataView } from "./withEntireDataView.js";

/**
 * A prepared execution whose definition is identified by `defId`, so two executions built with the
 * same id are `equals()` and share a definition fingerprint. `execute()` resolves on the next tick
 * and, when cancelling is on, rejects with an AbortError as soon as its signal is aborted.
 */
function makeExecution(defId: string, cancellable: boolean) {
    const definition: any = {
        workspace: "ws",
        buckets: [],
        attributes: [],
        measures: [{ measure: { localIdentifier: defId, definition: {} } }],
        filters: [],
        sortBy: [],
        dimensions: [{ itemIdentifiers: [] }],
        postProcessing: {},
    };

    const dataView: any = {
        definition,
        result: { definition, dimensions: [{ headers: [] }] },
        headerItems: [[]],
        data: [],
        offset: [0],
        count: [0],
        totalCount: [0],
    };

    let abortSignal: AbortSignal | undefined;
    const execution: any = {
        definition,
        equals: (other: any) => other?.definition?.measures?.[0]?.measure?.localIdentifier === defId,
        withSignal: (signal: AbortSignal) => {
            abortSignal = signal;
            return execution;
        },
        execute: () =>
            new Promise((resolve, reject) => {
                if (cancellable && abortSignal) {
                    abortSignal.addEventListener("abort", () => {
                        const error: any = new Error("The operation was aborted.");
                        error.name = "AbortError";
                        reject(error);
                    });
                }
                setTimeout(() => resolve({ readAll: () => Promise.resolve(dataView) }), 5);
            }),
    };

    return execution;
}

function Inner(props: ILoadingInjectedProps & Record<string, any>) {
    return (
        <div>
            <span data-testid="loading">{String(props.isLoading)}</span>
            <span data-testid="error">{String(props.error)}</span>
            <span data-testid="definition">
                {(props.dataView as any)?.definition?.measures?.[0]?.measure?.localIdentifier ?? "none"}
            </span>
        </div>
    );
}

const Wrapped: any = withEntireDataView(Inner as any);

async function renderExecutionSequence(defIds: string[], enableExecutionCancelling: boolean) {
    const onError = vi.fn();
    const props = (defId: string) => ({
        execution: makeExecution(defId, enableExecutionCancelling),
        onError,
        onLoadingChanged: vi.fn(),
        enableExecutionCancelling,
        locale: "en-US",
    });

    const [first, ...rest] = defIds;
    const { rerender, getByTestId } = render(<Wrapped {...props(first)} />);
    rest.forEach((defId) => rerender(<Wrapped {...props(defId)} />));

    await waitFor(() => {
        expect(getByTestId("loading").textContent).toBe("false");
    });
    // let the cancelled requests reject
    await new Promise((resolve) => setTimeout(resolve, 30));

    return {
        reportedErrors: onError.mock.calls.map(([error]: any[]) => error?.seType),
        error: getByTestId("error").textContent,
        definition: getByTestId("definition").textContent,
    };
}

describe("withEntireDataView", () => {
    /**
     * Regression for STL-3241. Opening a saved insight that carries a sort makes Analytical Designer
     * request the SAME execution definition twice with a different one in between (sorted →
     * sort-less → sorted), because the pluggable visualization's initial-properties push briefly
     * clears the extended reference point the sorts are read from. While the staleness of a response
     * was decided by the execution definition fingerprint, the first - already superseded and
     * cancelled - request stopped looking stale as soon as the third one re-registered its
     * fingerprint, and its AbortError was reported through `onError`. AD stores that as an execution
     * failure with an unknown error code and shows "Sorry, we can't display this visualization" over
     * a chart that loaded perfectly well.
     */
    it("should not report the cancellation of a superseded request whose definition is requested again", async () => {
        const outcome = await renderExecutionSequence(["sorted", "unsorted", "sorted"], true);

        expect(outcome).toEqual({ reportedErrors: [], error: "null", definition: "sorted" });
    });

    it("should not report the cancellation of superseded requests with distinct definitions", async () => {
        const outcome = await renderExecutionSequence(["first", "second", "third"], true);

        expect(outcome).toEqual({ reportedErrors: [], error: "null", definition: "third" });
    });

    it("should show the data of the last requested definition when nothing is cancelled", async () => {
        const outcome = await renderExecutionSequence(["sorted", "unsorted", "sorted"], false);

        expect(outcome).toEqual({ reportedErrors: [], error: "null", definition: "sorted" });
    });
});
