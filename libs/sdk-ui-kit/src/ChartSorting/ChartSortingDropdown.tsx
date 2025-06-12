// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { IntlShape } from "react-intl";
import { ISortItem } from "@gooddata/sdk-model";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown.js";
import { IAvailableSortsGroup, IBucketItemDescriptors } from "./types.js";

interface ChartSortingProps {
    currentSort: ISortItem[];
    availableSorts: IAvailableSortsGroup[];
    bucketItems: IBucketItemDescriptors;
    intl: IntlShape;
    onSelect: (item: ISortItem[]) => void;
    enableRenamingMeasureToMetric?: boolean;
}

const getAttributeName = (bucketItemNames: IBucketItemDescriptors, available: IAvailableSortsGroup) =>
    bucketItemNames[available.itemId.localIdentifier].name;

export const ChartSortingDropdown: React.FC<ChartSortingProps> = ({
    currentSort,
    availableSorts,
    bucketItems,
    intl,
    onSelect,
    enableRenamingMeasureToMetric,
}) => {
    const onSortChanged = useCallback(
        (newSort: ISortItem, index: number) => {
            const newSortItems = [...currentSort];
            newSortItems[index] = newSort;
            onSelect(newSortItems);
        },
        [onSelect, currentSort],
    );

    return (
        <div className="gd-sort-attribute-section">
            {availableSorts?.map((availableSort: IAvailableSortsGroup, index: number) => {
                // Obtain current sort item with the same id as current index
                const currentSortItem: ISortItem = currentSort[index];

                if (!currentSortItem) {
                    return null;
                }
                return (
                    <div
                        aria-label={`sort-attribute-${index}`}
                        key={index}
                        className={`gd-sort-attribute-item s-sort-attribute-item-${index}`}
                    >
                        {availableSorts.length > 1 && (
                            <div className="attribute-sorting-title">
                                {getAttributeName(bucketItems, availableSort)}
                            </div>
                        )}
                        <AttributeDropdown
                            index={index}
                            currentSortItem={currentSortItem}
                            availableSorts={availableSort}
                            bucketItems={bucketItems}
                            intl={intl}
                            onSelect={(newSort: ISortItem) => {
                                onSortChanged(newSort, index);
                            }}
                            enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                        />
                    </div>
                );
            })}
        </div>
    );
};
