// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { invariant } from "ts-invariant";

import { type IDashboardAttributeFilter, type IDashboardDateFilter, isUriRef } from "@gooddata/sdk-model";

import {
    useDependentCommonDateFilterConfigurationState,
    useDependentDateFilterConfigurationState,
} from "./useDependentDateFilterConfigurationState.js";
import { setAttributeFilterDependentDateFilters } from "../../../../../../model/commands/filters.js";
import { useDispatchDashboardCommand } from "../../../../../../model/react/useDispatchDashboardCommand.js";
import { type IDashboardDependentDateFilter } from "../../../../../../model/types/dateFilterTypes.js";

export function useDependentDateFiltersConfiguration(
    neighborDateFilters: IDashboardDateFilter[],
    currentFilter: IDashboardAttributeFilter,
    commonDateFilter?: IDashboardDateFilter,
) {
    const { filterElementsByDate, localIdentifier: currentFilterLocalId } = currentFilter.attributeFilter;

    invariant(
        currentFilterLocalId,
        "Cannot initialize the attribute filter configuration panel, filter has missing 'localIdentifier' property",
    );

    const saveDependentDateFilterCommand = useDispatchDashboardCommand(
        setAttributeFilterDependentDateFilters,
    );

    const originalState = useDependentDateFilterConfigurationState(
        neighborDateFilters,
        commonDateFilter,
        filterElementsByDate,
    );

    const originalCommonDateFilterState = useDependentCommonDateFilterConfigurationState(commonDateFilter);

    const [dependentDateFilters, setDependentDateFilters] =
        useState<IDashboardDependentDateFilter[]>(originalState);

    const [dependentCommonDateFilter, setDependentCommonDateFilter] = useState<IDashboardDateFilter>(
        originalCommonDateFilterState,
    );

    const onDependentDateFiltersSelect = (
        item: IDashboardDependentDateFilter,
        isSelected: boolean,
        isCommonDate: boolean,
    ) => {
        const localIdentifier = item.dataSet;
        invariant(!isUriRef(localIdentifier));

        const changedParentIndex = dependentDateFilters.findIndex(
            (dependentDateFilter) =>
                dependentDateFilter.localIdentifier === localIdentifier?.identifier &&
                dependentDateFilter.isCommonDate === isCommonDate,
        );

        if (changedParentIndex === -1) {
            setDependentDateFilters([...dependentDateFilters, item]);
        } else {
            if (isCommonDate) {
                const filteredDependentDateFilters = dependentDateFilters.filter(
                    (_, index) => index !== changedParentIndex,
                );

                setDependentDateFilters(filteredDependentDateFilters);
            } else {
                const changedItem = { ...dependentDateFilters[changedParentIndex], isSelected };

                const changedParentItems = dependentDateFilters.map((item, index) =>
                    index === changedParentIndex ? changedItem : item,
                );

                setDependentDateFilters(changedParentItems);
            }
        }
    };

    const onDependentDateFiltersConfigurationChanged = useMemo<boolean>(() => {
        return !isEqual(dependentDateFilters, originalState);
    }, [dependentDateFilters, originalState]);

    const onConfigurationClose = useCallback(() => {
        setDependentDateFilters(originalState);
        setDependentCommonDateFilter(originalCommonDateFilterState);
    }, [originalState, originalCommonDateFilterState]);

    const onDependentDateFiltersChange = useCallback(() => {
        // dispatch the command only if the configuration changed
        if (onDependentDateFiltersConfigurationChanged) {
            const dateFilters = dependentDateFilters
                .filter((filter) => filter.isSelected)
                .map((filter) => ({
                    filterLocalIdentifier: filter.localIdentifier,
                    isCommonDate: filter.isCommonDate,
                }));

            saveDependentDateFilterCommand(currentFilter.attributeFilter.localIdentifier!, dateFilters);
        }
    }, [
        dependentDateFilters,
        onDependentDateFiltersConfigurationChanged,
        currentFilter,
        saveDependentDateFilterCommand,
    ]);

    return {
        dependentDateFilters,
        dependentCommonDateFilter,
        onDependentDateFiltersSelect,
        onConfigurationClose,
        onDependentDateFiltersConfigurationChanged,
        onDependentDateFiltersChange,
    };
}
