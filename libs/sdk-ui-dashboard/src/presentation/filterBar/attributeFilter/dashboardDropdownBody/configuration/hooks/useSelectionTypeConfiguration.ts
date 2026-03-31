// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionType,
    DashboardAttributeFilterSelectionTypeValues,
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardAttributeFilter,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

import { setDashboardAttributeFilterSelectionType } from "../../../../../../model/commands/dashboard.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../../../model/react/useDashboardCommandProcessing.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";

export function useSelectionTypeConfiguration(filterItem: DashboardAttributeFilterItem) {
    const { run: changeSelectionType } = useDashboardCommandProcessing({
        commandCreator: setDashboardAttributeFilterSelectionType,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filterItem);

    const currentFilterConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides).find(
        (item) => item.localIdentifier === localIdentifier,
    );

    // Default to listOrText, except list filter with single selection mode → listOnly
    const defaultSelectionType =
        isDashboardAttributeFilter(filterItem) && isSingleSelectionFilter(filterItem)
            ? DashboardAttributeFilterSelectionTypeValues.LIST
            : DashboardAttributeFilterSelectionTypeValues.LIST_OR_TEXT;
    const originalSelectionType = currentFilterConfig?.selectionType ?? defaultSelectionType;

    const [selectionType, setSelectionType] =
        useState<DashboardAttributeFilterSelectionType>(originalSelectionType);

    const selectionTypeChanged = originalSelectionType !== selectionType;

    const onSelectionTypeUpdate = useCallback((value: DashboardAttributeFilterSelectionType) => {
        setSelectionType(value);
    }, []);

    const onSelectionTypeChange = useCallback(() => {
        if (selectionType !== originalSelectionType) {
            changeSelectionType(localIdentifier as string, selectionType);
        }
    }, [localIdentifier, originalSelectionType, changeSelectionType, selectionType]);

    const onConfigurationClose = useCallback(() => {
        setSelectionType(originalSelectionType);
    }, [originalSelectionType]);

    return {
        selectionType,
        selectionTypeChanged,
        onSelectionTypeUpdate,
        onSelectionTypeChange,
        onConfigurationClose,
    };
}
