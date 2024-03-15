// (C) 2024 GoodData Corporation
import { useCallback, useState } from "react";
import { IDashboardAttributeFilter, IDashboardDateFilter } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

import { IDashboardDependentDateFilter } from "../../../../../../model/index.js";
import { useDependentDateFilterConfigurationState } from "./useDependentDateFilterConfigurationState.js";

export function useDependentDateFiltersConfiguration(
    neighborDateFilters: IDashboardDateFilter[],
    currentFilter: IDashboardAttributeFilter,
    commonDateFilter?: IDashboardDateFilter,
) {
    const { localIdentifier: currentFilterLocalId } = currentFilter.attributeFilter;

    invariant(
        currentFilterLocalId,
        "Cannot initialize the attribute filter configuration panel, filter has missing 'localIdentifier' property",
    );

    const originalState = useDependentDateFilterConfigurationState(neighborDateFilters, commonDateFilter);

    const [dependentDateFilters, setDependentDateFilters] =
        useState<IDashboardDependentDateFilter[]>(originalState);

    const onConfigurationClose = useCallback(() => {
        setDependentDateFilters(originalState);
    }, [originalState]);

    return {
        dependentDateFilters,
        onConfigurationClose,
    };
}
