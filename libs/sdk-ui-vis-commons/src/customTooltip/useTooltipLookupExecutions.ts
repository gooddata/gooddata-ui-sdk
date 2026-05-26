// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type ISeparators } from "@gooddata/sdk-model";
import { type GoodDataSdkError, useCancelablePromise } from "@gooddata/sdk-ui";

import { type ITooltipExecutionBundle, type ITooltipExecutionMeta } from "./tooltipExecution.js";
import { type ITooltipLookupLocalizedStrings, buildLookupTable } from "./tooltipLookup.js";
import { type IResolvedReferenceValues } from "./types.js";

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

async function executeOne(execution: IPreparedExecution): Promise<IDataView> {
    const result = await execution.execute();
    return result.readAll();
}

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
 * Single-bundle variant for chart families that have one tooltip execution per
 * chart (e.g. Highcharts). Returns `undefined` while no bundle is provided or
 * before the first result lands; consumers handle that as "no external values".
 *
 * @internal
 */
export function useTooltipLookup(
    bundle: ITooltipExecutionBundle | undefined,
    separators?: ISeparators,
    localizedStrings?: ITooltipLookupLocalizedStrings,
): Map<string, IResolvedReferenceValues> | undefined {
    const fingerprint = bundle?.execution.fingerprint();

    const { result } = useCancelablePromise<IDataView, GoodDataSdkError>(
        {
            promise: bundle ? () => executeOne(bundle.execution) : undefined,
        },
        [fingerprint],
    );

    return useMemo(() => {
        if (!result || !bundle) {
            return undefined;
        }
        return buildLookupTable(result, bundle.meta, separators, localizedStrings);
    }, [result, bundle, separators, localizedStrings]);
}

/**
 * Multi-bundle variant for chart families that key tooltip executions per
 * sub-target (e.g. geo per-layer). `context` is required so the produced
 * lookup carries whatever the caller needs to interpret the result —
 * downstream code does not have to defensively check for missing context.
 *
 * @internal
 */
export function useTooltipLookupExecutions<TContext>(
    entries: readonly ITooltipLookupExecutionEntry<TContext>[],
    separators?: ISeparators,
    localizedStrings?: ITooltipLookupLocalizedStrings,
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
                lookup: buildLookupTable(entry.dataView, entry.meta, separators, localizedStrings),
                context: entry.context,
            });
        }
        return lookups;
    }, [result, separators, localizedStrings]);
}
