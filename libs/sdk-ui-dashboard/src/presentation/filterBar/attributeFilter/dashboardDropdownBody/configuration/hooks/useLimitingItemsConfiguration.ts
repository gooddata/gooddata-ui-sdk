// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual, partition } from "lodash-es";

import { type IDashboardAttributeFilter, type ObjRef } from "@gooddata/sdk-model";

import { setAttributeFilterLimitingItems } from "../../../../../../model/commands/dashboard.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../../../model/react/useDashboardCommandProcessing.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectRestrictedLimitingItemsMap } from "../../../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";

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

    // like the parent filters it lists, the panel shows only the items the user may read
    const restrictedLimitingItemsMap = useDashboardSelector(selectRestrictedLimitingItemsMap);
    const [restrictedLimitingItems, originalLimitingItems] = useMemo(
        () =>
            partition(currentFilter.attributeFilter.validateElementsBy ?? [], (item) =>
                restrictedLimitingItemsMap.has(item),
            ),
        [currentFilter, restrictedLimitingItemsMap],
    );
    const [limitingItems, setLimitingItems] = useState(originalLimitingItems ?? []);
    const limitingItemsChanged = !isEqual(originalLimitingItems, limitingItems);

    const onLimitingItemsUpdate = useCallback((value: ObjRef[]) => {
        setLimitingItems(value);
    }, []);

    const onLimitingItemsChange = useCallback(() => {
        if (!isEqual(originalLimitingItems, limitingItems)) {
            // the command replaces the whole list, so carry over the items the panel cannot show
            changeAttributeFilterLimitingItems(currentFilterLocalId!, [
                ...restrictedLimitingItems,
                ...limitingItems,
            ]);
        }
    }, [
        currentFilterLocalId,
        originalLimitingItems,
        restrictedLimitingItems,
        changeAttributeFilterLimitingItems,
        limitingItems,
    ]);

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
