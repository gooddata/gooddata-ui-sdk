// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { invariant } from "ts-invariant";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterByDate,
    type IDashboardDateFilter,
    isUriRef,
} from "@gooddata/sdk-model";

import { setAttributeFilterDependentDateFilters } from "../../../../../../model/commands/filters.js";
import { useDispatchDashboardCommand } from "../../../../../../model/react/useDispatchDashboardCommand.js";
import { type IDashboardDependentDateFilter } from "../../../../../../model/types/dateFilterTypes.js";

import {
    useDependentCommonDateFilterConfigurationState,
    useDependentDateFilterConfigurationState,
} from "./useDependentDateFilterConfigurationState.js";

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
        invariant(!isUriRef(item.dataSet));

        // Match on item.localIdentifier rather than item.dataSet?.identifier (the dataset identifier):
        // state entries now store dateFilter.localIdentifier as their key, which matches item.localIdentifier
        // since both come from the same useDependentDateFilterConfigurationState initializer.
        const changedParentIndex = dependentDateFilters.findIndex(
            (dependentDateFilter) =>
                dependentDateFilter.localIdentifier === item.localIdentifier &&
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
            // Common date filter has no dimension of its own, so we reference it by its own
            // localIdentifier (falling back to the canonical common-date id) and carry the chosen
            // dimension in the separate `dataSet` field. Specific date filters are referenced by their
            // localIdentifier and need no dataSet (it is derived from the referenced filter).
            const commonDateLocalId =
                commonDateFilter?.dateFilter.localIdentifier ?? generateDateFilterLocalIdentifier(0);

            const dateFilters: IDashboardAttributeFilterByDate[] = dependentDateFilters
                .filter((filter) => filter.isSelected)
                .map((filter) =>
                    filter.isCommonDate
                        ? {
                              filterLocalIdentifier: commonDateLocalId,
                              isCommonDate: true,
                              dataSet: filter.dataSet,
                          }
                        : {
                              filterLocalIdentifier: filter.localIdentifier,
                              isCommonDate: false,
                          },
                );

            saveDependentDateFilterCommand(currentFilter.attributeFilter.localIdentifier!, dateFilters);
        }
    }, [
        dependentDateFilters,
        onDependentDateFiltersConfigurationChanged,
        currentFilter,
        commonDateFilter,
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
