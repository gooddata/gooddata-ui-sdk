// (C) 2024-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";

import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";

import {
    selectAttributeFilterConfigsOverrides,
    setAttributeFilterLimitingItems,
    useDashboardCommandProcessing,
    useDashboardSelector,
} from "../../../../../../model/index.js";

export const useLimitingItemsConfiguration = (currentFilter: IDashboardAttributeFilter) => {
    const { run: changeAttributeFilterLimitingItems } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterLimitingItems,
        successEvent: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const currentFilterConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides).find(
        (item) => item.localIdentifier === currentFilter.attributeFilter.localIdentifier,
    );
    const currentFilterLocalId =
        currentFilterConfig?.localIdentifier || currentFilter?.attributeFilter.localIdentifier;

    const originalLimitingItems = useMemo(
        () => currentFilter.attributeFilter.validateElementsBy ?? [],
        [currentFilter],
    );
    const [limitingItems, setLimitingItems] = useState(originalLimitingItems ?? []);
    const limitingItemsChanged = !isEqual(originalLimitingItems, limitingItems);

    const onLimitingItemsUpdate = useCallback((value: ObjRef[]) => {
        setLimitingItems(value);
    }, []);

    const onLimitingItemsChange = useCallback(() => {
        if (!isEqual(originalLimitingItems, limitingItems)) {
            changeAttributeFilterLimitingItems(currentFilterLocalId!, limitingItems);
        }
    }, [currentFilterLocalId, originalLimitingItems, changeAttributeFilterLimitingItems, limitingItems]);

    const onConfigurationClose = useCallback(() => {
        setLimitingItems(originalLimitingItems);
    }, [originalLimitingItems]);

    return {
        limitingItems,
        limitingItemsChanged,
        onLimitingItemsUpdate,
        onLimitingItemsChange,
        onConfigurationClose,
    };
};
