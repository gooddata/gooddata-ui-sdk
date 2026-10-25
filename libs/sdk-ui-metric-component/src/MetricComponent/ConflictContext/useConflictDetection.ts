// (C) 2023-2026 GoodData Corporation

import { useCallback, useContext } from "react";

import { type IMeasureOverride } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useOtherMetrics } from "../Form/OtherMetrics/useOtherMetrics.js";
import { type IPrefixes } from "../Form/Prefixes/PrefixesContext.js";
import { usePrefixes } from "../Form/Prefixes/usePrefixes.js";
import { generateUniqIdByIds } from "../metric/nameGenerators.js";

import { ConflictContext } from "./ConflictContext.js";

export type MetricIdConflicts = {
    conflictWith: Array<string>;
    usableIds: string[];
};

/**
 * @internal
 */
export type ConflictChecker = (identifiers: string[]) => Promise<IMeasureOverride[]>;

export function useConflictDetection(): (metricId?: string) => Promise<MetricIdConflicts> {
    const { checker } = useContext(ConflictContext);
    const { otherMetrics } = useOtherMetrics();
    const prefixes = usePrefixes();

    return useCallback(
        (metricId): Promise<MetricIdConflicts> => {
            if (!metricId) {
                return Promise.resolve({ conflictWith: [], usableIds: [] });
            }

            const possible = generatePossibleIds(prefixes, metricId, otherMetrics);
            return checker([metricId, ...possible])
                .then((conflicts) => {
                    const map = conflicts.reduce(
                        (prev, { identifier, origins }) => {
                            prev[identifier] = origins;
                            return prev;
                        },
                        {} as Record<string, Array<string>>,
                    );

                    const conflictWith = map[metricId] || [];
                    const usableIds = possible.filter((id) => (map[id] || []).length === 0);

                    return {
                        conflictWith,
                        usableIds,
                    };
                })
                .catch(() => {
                    //NOTE: Send empty object, there need to be check in parent app,
                    // who need to solve error somehow
                    return {
                        conflictWith: [],
                        usableIds: [],
                    };
                });
        },
        [otherMetrics, checker, prefixes],
    );
}

function generatePossibleIds(
    prefixes: IPrefixes,
    currentId: string | undefined,
    metrics: IMeasureMetadataObject[],
) {
    const ids = metrics.map((m) => m.id);
    const available: string[] = [];
    for (let i = 0; i < 10; i++) {
        const generated = generateUniqIdByIds(prefixes.current, currentId, ids, prefixes.parents);
        available.push(generated);
        ids.push(generated);
    }
    return available;
}
