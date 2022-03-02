// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { IntlShape } from "react-intl";
import { ISortItem } from "@gooddata/sdk-model";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown";
import { IAvailableSortsGroup, IBucketItemNames } from "./types";

interface ChartSortingProps {
    currentSort: ISortItem[];
    availableSorts: IAvailableSortsGroup[];
    bucketItemNames: IBucketItemNames;
    intl: IntlShape;
    onSelect: (item: ISortItem[]) => void;

    enableRenamingMeasureToMetric?: boolean;
}

const getAttributeName = (bucketItemNames: IBucketItemNames, available: IAvailableSortsGroup) =>
    bucketItemNames[available.itemId.localIdentifier].name;

export const ChartSortingDropdown: React.FC<ChartSortingProps> = ({
    currentSort,
    availableSorts,
    bucketItemNames,
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
        <>
            <div className="gd-sort-attribute-section">
                {currentSort &&
                    currentSort.map((currentSortItem: ISortItem, index: number) => {
                        // Obtain availables items with same id as current index
                        const available: IAvailableSortsGroup = availableSorts[index];

                        return (
                            <div
                                key={index}
                                className={`gd-sort-attribute-item s-sort-attribute-item-${index}`}
                            >
                                {currentSort.length > 1 && (
                                    <div className="attribute-sorting-title">
                                        {getAttributeName(bucketItemNames, available)}
                                    </div>
                                )}
                                <AttributeDropdown
                                    index={index}
                                    currentSortItem={currentSortItem}
                                    availableSorts={available}
                                    bucketItemNames={bucketItemNames}
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
        </>
    );
};
