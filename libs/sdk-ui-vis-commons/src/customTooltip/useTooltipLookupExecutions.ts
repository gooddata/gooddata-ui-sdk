// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type ISeparators } from "@gooddata/sdk-model";
import { type GoodDataSdkError, useCancelablePromise } from "@gooddata/sdk-ui";

import { type ITooltipExecution, type ITooltipExecutionMeta } from "./tooltipExecution.js";
import { buildLookupTable } from "./tooltipLookup.js";
import { type IResolvedReferenceValues } from "./types.js";

async function executeOne(execution: IPreparedExecution): Promise<IDataView> {
    const result = await execution.execute();
    return result.readAll();
}

/** A successfully-executed bundle: its dataView paired with the meta to read it. */
interface IExecutionInput {
    dataView: IDataView;
    meta: ITooltipExecutionMeta;
}

/**
 * Execute the batch; on failure, fan out to per-reference bundles so a single
 * bad reference (e.g. one that 400s the batched AFM) only takes itself down
 * while the rest still resolve. Isolation is structural — a failed reference is
 * left out of the returned inputs and renders the unresolved default, with no
 * parsing of the backend error. Fan-out fires on *any* batch rejection (a
 * transient 5xx/timeout too, not just a bad-ref 400), so a flaky backend can
 * produce N follow-up executions per plan.
 */
async function runWithFallback(execution: ITooltipExecution): Promise<IExecutionInput[]> {
    try {
        const dataView = await executeOne(execution.batch.execution);
        return [{ dataView, meta: execution.batch.meta }];
    } catch {
        // Build the per-reference bundles now (lazy) and keep the ones that resolve.
        const perRef = execution.perRef();
        const settled = await Promise.allSettled(perRef.map((bundle) => executeOne(bundle.execution)));
        const inputs: IExecutionInput[] = [];
        settled.forEach((result, index) => {
            if (result.status === "fulfilled") {
                inputs.push({ dataView: result.value, meta: perRef[index].meta });
            }
        });
        return inputs;
    }
}

/**
 * Merge per-execution lookups into one map (by point key, shallow-merging the
 * per-point reference statuses). Built in a memo so a separators change rebuilds
 * without re-executing.
 */
function buildLookup(
    inputs: IExecutionInput[],
    separators?: ISeparators,
): Map<string, IResolvedReferenceValues> {
    const lookup = new Map<string, IResolvedReferenceValues>();
    for (const { dataView, meta } of inputs) {
        for (const [pointKey, values] of buildLookupTable(dataView, meta, separators)) {
            const existing = lookup.get(pointKey);
            lookup.set(pointKey, existing ? { ...existing, ...values } : values);
        }
    }
    return lookup;
}

/**
 * Single-execution variant for chart families that have one tooltip execution
 * per chart (e.g. Highcharts). Returns `undefined` while no execution is
 * provided or before the first result lands; consumers handle that as "no
 * external values".
 *
 * @internal
 */
export function useTooltipLookup(
    execution: ITooltipExecution | undefined,
    separators?: ISeparators,
): Map<string, IResolvedReferenceValues> | undefined {
    const fingerprint = execution?.batch.execution.fingerprint();

    const { result } = useCancelablePromise<IExecutionInput[], GoodDataSdkError>(
        {
            promise: execution ? () => runWithFallback(execution) : undefined,
        },
        [fingerprint],
    );

    return useMemo(() => (result ? buildLookup(result, separators) : undefined), [result, separators]);
}

/**
 * One tooltip execution plan paired with a caller-owned key and the context
 * that travels with the built lookup.
 *
 * @internal
 */
export interface ITooltipLookupExecutionEntry<TContext> {
    key: string;
    execution: ITooltipExecution;
    context: TContext;
}

/**
 * Built lookup for one tooltip execution entry (per-entry fan-out, mirroring
 * the single-execution variant).
 *
 * @internal
 */
export interface ITooltipLookupExecutionResult<TContext> {
    lookup: Map<string, IResolvedReferenceValues>;
    context: TContext;
}

interface IExecutedEntry<TContext> {
    key: string;
    inputs: IExecutionInput[];
    context: TContext;
}

const EMPTY_LOOKUPS = new Map<string, ITooltipLookupExecutionResult<unknown>>();

function getEntriesFingerprint<TContext>(entries: readonly ITooltipLookupExecutionEntry<TContext>[]): string {
    return entries
        .map((entry) => `${entry.key}::${entry.execution.batch.execution.fingerprint()}`)
        .join("||");
}

async function executeAll<TContext>(
    entries: readonly ITooltipLookupExecutionEntry<TContext>[],
): Promise<Array<IExecutedEntry<TContext>>> {
    // runWithFallback resolves for any execution failure (a failed reference is
    // just omitted), so allSettled only guards a stray throw — one layer can't
    // drop the rest.
    const settled = await Promise.allSettled(
        entries.map(async (entry) => ({
            key: entry.key,
            inputs: await runWithFallback(entry.execution),
            context: entry.context,
        })),
    );
    return settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

/**
 * Multi-execution variant for chart families that key tooltip executions per
 * sub-target (e.g. geo per-layer). Each entry runs through the same batch →
 * per-reference fan-out as the single-execution variant. `context` travels with
 * the built lookup so downstream code needn't defensively check for it.
 *
 * @internal
 */
export function useTooltipLookupExecutions<TContext>(
    entries: readonly ITooltipLookupExecutionEntry<TContext>[],
    separators?: ISeparators,
): Map<string, ITooltipLookupExecutionResult<TContext>> {
    const fingerprint = getEntriesFingerprint(entries);

    const { result } = useCancelablePromise<Array<IExecutedEntry<TContext>>, GoodDataSdkError>(
        {
            promise: entries.length > 0 ? () => executeAll(entries) : undefined,
        },
        [fingerprint],
    );

    return useMemo(() => {
        if (!result) {
            return EMPTY_LOOKUPS as Map<string, ITooltipLookupExecutionResult<TContext>>;
        }

        const lookups = new Map<string, ITooltipLookupExecutionResult<TContext>>();
        for (const entry of result) {
            const lookup = buildLookup(entry.inputs, separators);
            lookups.set(entry.key, { lookup, context: entry.context });
        }
        return lookups;
    }, [result, separators]);
}
