// (C) 2019-2022 GoodData Corporation
import { useCallback, useEffect, useState } from "react";
import { IDrillConfigItem, isAvailableDrillTargetMeasure } from "../../../../drill/types.js";
import { IAvailableDrillTargetItem } from "../../../../drill/DrillSelect/types.js";
import { InsightDrillDefinition } from "@gooddata/sdk-model";
import { usePrevious } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";

const addOrUpdateDrillConfigItem = (drillConfigItems: IDrillConfigItem[], newItem: IDrillConfigItem) => {
    const found = drillConfigItems.findIndex(
        (drillConfigItem) => drillConfigItem.localIdentifier === newItem.localIdentifier,
    );
    if (found !== -1) {
        const incompleteItemsUpdated = [...drillConfigItems];
        incompleteItemsUpdated[found] = newItem;
        return incompleteItemsUpdated;
    } else {
        return [...drillConfigItems, newItem];
    }
};

/**
 * Props for hook for manipulation with incomplete IDrillConfigItem
 * @internal
 */
export interface IUseIncompleteItemsProps {
    widgetDrills: InsightDrillDefinition[];
}

/**
 * Hook for manipulation with incomplete IDrillConfigItem
 * @internal
 */
export const useIncompleteItems = (props: IUseIncompleteItemsProps) => {
    const { widgetDrills } = props;
    const [incompleteItems, updateIncompleteItems] = useState<IDrillConfigItem[]>([]);
    const prevWidgetDrills = usePrevious(widgetDrills);

    useEffect(() => {
        //when widgetDrills changed remove all complete widget items
        if (!isEqual(widgetDrills, prevWidgetDrills)) {
            const incompleteItemsUpdated = incompleteItems.filter(
                (incompleteItem) => !incompleteItem.complete,
            );

            if (incompleteItemsUpdated.length !== incompleteItems.length) {
                updateIncompleteItems(incompleteItemsUpdated);
            }
        }
    }, [widgetDrills, prevWidgetDrills, incompleteItems]);

    const addIncompleteItem = useCallback(
        (item: IDrillConfigItem) => {
            updateIncompleteItems(addOrUpdateDrillConfigItem(incompleteItems, item));
        },
        [incompleteItems],
    );

    const deleteIncompleteItem = useCallback(
        (item: IDrillConfigItem) => {
            const incompleteItemsUpdated = incompleteItems.filter(
                (incompleteItem) => incompleteItem.localIdentifier !== item.localIdentifier,
            );
            updateIncompleteItems(incompleteItemsUpdated);
        },
        [incompleteItems],
    );

    const completeItem = useCallback(
        (item: IDrillConfigItem) => {
            const incompleteItemsUpdated = incompleteItems.map((incompleteItem) => {
                if (incompleteItem.localIdentifier === item.localIdentifier) {
                    return { ...incompleteItem, complete: true };
                }

                return incompleteItem;
            });
            updateIncompleteItems(incompleteItemsUpdated);
        },
        [incompleteItems],
    );

    const onChangeItem = useCallback(
        (changedItem: IDrillConfigItem) => {
            const incompleteItem: IDrillConfigItem = {
                ...changedItem,
                complete: false,
            };
            addIncompleteItem(incompleteItem);
        },
        [addIncompleteItem],
    );

    const onOriginSelect = useCallback(
        (selectedItem: IAvailableDrillTargetItem) => {
            if (isAvailableDrillTargetMeasure(selectedItem)) {
                const incompleteMeasureItem: IDrillConfigItem = {
                    type: "measure",
                    localIdentifier: selectedItem.measure.measureHeaderItem.localIdentifier,
                    title: selectedItem.measure.measureHeaderItem.name,
                    attributes: selectedItem.attributes,
                    drillTargetType: undefined,
                    complete: false,
                };

                addIncompleteItem(incompleteMeasureItem);
            } else {
                const incompleteAttributeItem: IDrillConfigItem = {
                    type: "attribute",
                    localIdentifier: selectedItem.attribute.attributeHeader.localIdentifier,
                    title: selectedItem.attribute.attributeHeader.formOf.name,
                    attributes: selectedItem.intersectionAttributes,
                    drillTargetType: undefined,
                    complete: false,
                };

                addIncompleteItem(incompleteAttributeItem);
            }
        },
        [addIncompleteItem],
    );

    const isItemNew = useCallback(
        (changedItem: IDrillConfigItem) => {
            // interaction is new if it has an incomplete item associated with it
            return incompleteItems.some(
                (incompleteItem) =>
                    incompleteItem.localIdentifier === changedItem.localIdentifier &&
                    !incompleteItem.complete,
            );
        },
        [incompleteItems],
    );

    return {
        incompleteItems,
        isItemNew,
        completeItem,
        deleteIncompleteItem,
        onChangeItem,
        onOriginSelect,
    };
};
