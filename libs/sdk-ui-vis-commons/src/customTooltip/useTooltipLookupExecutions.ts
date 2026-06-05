// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type ISeparators } from "@gooddata/sdk-model";
import { type GoodDataSdkError, useCancelablePromise } from "@gooddata/sdk-ui";

import { type ITooltipExecution, type ITooltipExecutionMeta } from "./tooltipExecution.js";
import { buildLookupTable } from "./tooltipLookup.js";
import { type IResolvedReferenceValues, labelKey, metricKey } from "./types.js";

async function executeOne(execution: IPreparedExecution): Promise<IDataView> {
    const result = await execution.execute();
    return result.readAll();
}

/**
 * Reference keys (`metric/id`, `label/id`) a bundle's meta covers. Used to mark
 * a failed per-reference bundle's references as errored.
 */
function refKeysOfMeta(meta: ITooltipExecutionMeta): string[] {
    return [
        ...Object.values(meta.measureIdMap).map(metricKey),
        ...Object.values(meta.labelIdMap).map(labelKey),
    ];
}

/**
 * Built lookup plus references that could not be retrieved at all (their fetch
 * rejected even in the per-reference fallback). Errored references render as
 * "(Data could not be retrieved)" at every point.
 *
 * @internal
 */
export interface ITooltipLookupResult {
    lookup: Map<string, IResolvedReferenceValues>;
    erroredRefs: ReadonlySet<string>;
}

// Successful (dataView, meta) pairs + failed ref keys; built into the lookup in a memo so separators changes don't re-execute.
interface IExecutionOutcome {
    inputs: Array<{ dataView: IDataView; meta: ITooltipExecutionMeta }>;
    erroredRefs: Set<string>;
}

/**
 * Execute the batch; on failure, fan out to per-reference bundles so a single
 * bad reference (e.g. one that 400s the batched AFM) only errors itself while
 * the rest still resolve. No reliance on parsing the backend error — failure is
 * isolated structurally by which per-reference execution rejects.
 */
async function runWithFallback(execution: ITooltipExecution): Promise<IExecutionOutcome> {
    try {
        const dataView = await executeOne(execution.batch.execution);
        return { inputs: [{ dataView, meta: execution.batch.meta }], erroredRefs: new Set() };
    } catch {
        // Build the per-reference bundles now (lazy) and isolate each.
        const perRef = execution.perRef();
        const settled = await Promise.allSettled(perRef.map((bundle) => executeOne(bundle.execution)));
        const inputs: IExecutionOutcome["inputs"] = [];
        const erroredRefs = new Set<string>();
        settled.forEach((result, index) => {
            const bundle = perRef[index];
            if (result.status === "fulfilled") {
                inputs.push({ dataView: result.value, meta: bundle.meta });
            } else {
                refKeysOfMeta(bundle.meta).forEach((key) => erroredRefs.add(key));
            }
        });
        return { inputs, erroredRefs };
    }
}

/**
 * Merge per-execution lookups into one map (by point key, shallow-merging the
 * per-point reference statuses) and pair it with the errored references.
 */
function buildResult(outcome: IExecutionOutcome, separators?: ISeparators): ITooltipLookupResult {
    const lookup = new Map<string, IResolvedReferenceValues>();
    for (const { dataView, meta } of outcome.inputs) {
        for (const [pointKey, values] of buildLookupTable(dataView, meta, separators)) {
            const existing = lookup.get(pointKey);
            lookup.set(pointKey, existing ? { ...existing, ...values } : values);
        }
    }
    return { lookup, erroredRefs: outcome.erroredRefs };
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
): ITooltipLookupResult | undefined {
    const fingerprint = execution?.batch.execution.fingerprint();

    const { result } = useCancelablePromise<IExecutionOutcome, GoodDataSdkError>(
        {
            promise: execution ? () => runWithFallback(execution) : undefined,
        },
        [fingerprint],
    );

    return useMemo(() => (result ? buildResult(result, separators) : undefined), [result, separators]);
}

/**
 * One prepared tooltip execution paired with a caller-owned key and the
 * context that travels with the built lookup.
 *
 * @internal
 */
export interface ITooltipLookupExecutionEntry<TContext> {
    key: string;
    execution: IPreparedExecution;
    meta: ITooltipExecutionMeta;
    context: TContext;
}

/**
 * Built lookup for one tooltip execution entry.
 *
 * @internal
 */
export interface ITooltipLookupExecutionResult<TContext> {
    lookup: Map<string, IResolvedReferenceValues>;
    context: TContext;
}

interface IExecutedEntry<TContext> extends ITooltipLookupExecutionEntry<TContext> {
    dataView: IDataView;
}

const EMPTY_LOOKUPS = new Map<string, ITooltipLookupExecutionResult<unknown>>();

function getEntriesFingerprint<TContext>(entries: readonly ITooltipLookupExecutionEntry<TContext>[]): string {
    return entries.map((entry) => `${entry.key}::${entry.execution.fingerprint()}`).join("||");
}

async function executeAll<TContext>(
    entries: readonly ITooltipLookupExecutionEntry<TContext>[],
): Promise<Array<IExecutedEntry<TContext>>> {
    const settled = await Promise.allSettled(
        entries.map(async (entry) => ({ ...entry, dataView: await executeOne(entry.execution) })),
    );
    // Failed entries drop out silently; callers fall back when a lookup is missing.
    return settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

/**
 * Multi-execution variant for chart families that key tooltip executions per
 * sub-target (e.g. geo per-layer). `context` is required so the produced
 * lookup carries whatever the caller needs to interpret the result —
 * downstream code does not have to defensively check for missing context.
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
            lookups.set(entry.key, {
                lookup: buildLookupTable(entry.dataView, entry.meta, separators),
                context: entry.context,
            });
        }
        return lookups;
    }, [result, separators]);
}
