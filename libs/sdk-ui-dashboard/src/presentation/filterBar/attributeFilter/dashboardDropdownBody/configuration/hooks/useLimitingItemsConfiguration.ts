// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";

import { type IDashboardAttributeFilter, type ObjRef } from "@gooddata/sdk-model";

import { setAttributeFilterLimitingItems } from "../../../../../../model/commands/dashboard.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../../../model/react/useDashboardCommandProcessing.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";

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
