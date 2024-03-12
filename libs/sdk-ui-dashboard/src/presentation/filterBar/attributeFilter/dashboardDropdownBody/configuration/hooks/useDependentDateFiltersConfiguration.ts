// (C) 2024 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import {
    IDashboardAttributeFilter,
    IDashboardAttributeFilterByDate,
    IDashboardDateFilter,
    ObjRef,
    isUriRef,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import isEqual from "lodash/isEqual.js";

import {
    IDashboardDependentDateFilter,
    setAttributeFilterDependentDateFilters,
    useDispatchDashboardCommand,
} from "../../../../../../model/index.js";
import { useDependentDateFilterConfigurationState } from "./useDependentDateFilterConfigurationState.js";

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

    const [dependentDateFilters, setDependentDateFilters] =
        useState<IDashboardDependentDateFilter[]>(originalState);

    const onDependentDateFiltersSelect = (dataSet: ObjRef, isSelected: boolean) => {
        invariant(!isUriRef(dataSet));

        const changedParentIndex = dependentDateFilters.findIndex(
            (dependentDateFilter) => dependentDateFilter.localIdentifier === dataSet.identifier,
        );
        const changedItem = { ...dependentDateFilters[changedParentIndex] };

        changedItem.isSelected = isSelected;

        const changedParentItems = [...dependentDateFilters];
        changedParentItems[changedParentIndex] = changedItem;

        setDependentDateFilters(changedParentItems);
    };

    const onDependentDateFiltersConfigurationChanged = useMemo<boolean>(() => {
        return !isEqual(dependentDateFilters, originalState);
    }, [dependentDateFilters, originalState]);

    const onConfigurationClose = useCallback(() => {
        setDependentDateFilters(originalState);
    }, [originalState]);

    const onDependentDateFiltersChange = useCallback(() => {
        // dispatch the command only if the configuration changed
        if (onDependentDateFiltersConfigurationChanged) {
            const dateFilters: IDashboardAttributeFilterByDate[] = [];
            dependentDateFilters.forEach((dependentDateFilter) => {
                if (!dependentDateFilter.isSelected) {
                    return;
                }

                dateFilters.push({
                    filterLocalIdentifier: dependentDateFilter.localIdentifier,
                });
            });
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
        onDependentDateFiltersSelect,
        onConfigurationClose,
        onDependentDateFiltersConfigurationChanged,
        onDependentDateFiltersChange,
    };
}
