// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IFilter,
    filterLocalIdentifier,
    isAttributeFilter,
    isDateFilter,
    isDrillToInsight,
} from "@gooddata/sdk-model";

import { type IDashboardInsightProps } from "../../types.js";

export function useExcludedDrillDefinitionFilters(
    filtersForInsight: IFilter[] | undefined,
    drillStep: IDashboardInsightProps["drillStep"],
) {
    const ignoredDashboardFilterIds = useMemo(() => {
        if (!drillStep || !isDrillToInsight(drillStep.drillDefinition)) {
            return new Set<string>();
        }

        return new Set(drillStep.drillDefinition.ignoredDashboardFilters ?? []);
    }, [drillStep]);

    return useMemo(
        () =>
            filtersForInsight?.filter((filter) => {
                if (!isAttributeFilter(filter) && !isDateFilter(filter)) {
                    return true;
                }

                const localIdentifier = filterLocalIdentifier(filter);
                return localIdentifier === undefined || !ignoredDashboardFilterIds.has(localIdentifier);
            }),
        [filtersForInsight, ignoredDashboardFilterIds],
    );
}
