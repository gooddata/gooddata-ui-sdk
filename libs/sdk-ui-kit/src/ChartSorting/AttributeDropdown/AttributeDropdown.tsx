// (C) 2022 GoodData Corporation
import React, { useState, useRef, useEffect, useCallback } from "react";
import { IntlShape } from "react-intl";
import {
    ISortItem,
    isAttributeSort,
    sortDirection,
    isAttributeAreaSort,
    newAttributeSort,
    newAttributeAreaSort,
    newMeasureSort,
    isMeasureLocator,
} from "@gooddata/sdk-model";

import { IAvailableSortsGroup, SORT_TARGET_TYPE, ISortTypeItem, IBucketItemNames } from "../types";
import { Dropdown, DropdownButton, DropdownList } from "../../Dropdown";
import { SingleSelectListItem } from "../../List";
import { MeasureDropdown } from "../MeasureDropdown/MeasureDropdown";

interface AttributeDropdownProps {
    currentSortItem: ISortItem;
    availableSorts: IAvailableSortsGroup;
    bucketItemNames: IBucketItemNames;
    intl: IntlShape;
    index: number;
    onSelect: (item: ISortItem) => void;

    enableRenamingMeasureToMetric?: boolean;
}

const icons = {
    [SORT_TARGET_TYPE.ALPHABETICAL_ASC]: `gd-icon-sort-alphabetical-asc`,
    [SORT_TARGET_TYPE.ALPHABETICAL_DESC]: `gd-icon-sort-alphabetical-desc`,
    [SORT_TARGET_TYPE.NUMERICAL_ASC]: `gd-icon-sort-numerical-asc`,
    [SORT_TARGET_TYPE.NUMERICAL_DESC]: `gd-icon-sort-numerical-desc`,
};

const getIconClassNameBySelection = (sortType: string): string => icons[sortType];

const getSortTypeItems = (available: IAvailableSortsGroup, intl: IntlShape): ISortTypeItem[] => {
    const sortTypeItems: ISortTypeItem[] = [];

    if (available.attributeSort.normalSortEnabled) {
        sortTypeItems.push(
            {
                id: SORT_TARGET_TYPE.ALPHABETICAL_ASC,
                title: intl.formatMessage({ id: "sorting.type.alphabetical.asc" }),
                sortDirection: "asc",
                type: "alphabetical",
                localIdentifier: available.itemId.localIdentifier,
            },
            {
                id: SORT_TARGET_TYPE.ALPHABETICAL_DESC,
                title: intl.formatMessage({ id: "sorting.type.alphabetical.desc" }),
                sortDirection: "desc",
                type: "alphabetical",
                localIdentifier: available.itemId.localIdentifier,
            },
        );
    }

    if (
        available.attributeSort.areaSortEnabled ||
        (available.metricSorts && available.metricSorts.length > 0)
    ) {
        sortTypeItems.push(
            {
                id: SORT_TARGET_TYPE.NUMERICAL_ASC,
                title: intl.formatMessage({ id: "sorting.type.numerical.asc" }),
                sortDirection: "asc",
                type: "numerical",
                localIdentifier: available.itemId.localIdentifier,
            },
            {
                id: SORT_TARGET_TYPE.NUMERICAL_DESC,
                title: intl.formatMessage({ id: "sorting.type.numerical.desc" }),
                sortDirection: "desc",
                type: "numerical",
                localIdentifier: available.itemId.localIdentifier,
            },
        );
    }

    return sortTypeItems;
};

const getButtonValue = (sortTypeItems: ISortTypeItem[], type: string, direction: string): ISortTypeItem => {
    return sortTypeItems.find((sortTypeItems: ISortTypeItem) => sortTypeItems.id === `${type}-${direction}`);
};

export const AttributeDropdown: React.FC<AttributeDropdownProps> = ({
    currentSortItem,
    availableSorts,
    bucketItemNames,
    intl,
    index,
    onSelect,
    enableRenamingMeasureToMetric,
}) => {
    const [width, setWidth] = useState<number>(0);
    const [currentItem, setCurrentItem] = useState<ISortItem>(currentSortItem);
    const buttonRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (buttonRef && buttonRef.current) {
            setWidth(buttonRef?.current.getBoundingClientRect().width);
        }
    }, []);

    const attributeSelectHandler = useCallback(
        (item: ISortTypeItem) => {
            let newCurrentItem;
            if (item.type === "alphabetical") {
                newCurrentItem = newAttributeSort(item.localIdentifier, item.sortDirection);
            } else if (availableSorts.attributeSort.areaSortEnabled) {
                newCurrentItem = newAttributeAreaSort(item.localIdentifier, item.sortDirection);
            } else {
                const {
                    measureLocatorItem: { measureIdentifier },
                } = availableSorts.metricSorts[0].locators.find(isMeasureLocator);
                newCurrentItem = newMeasureSort(measureIdentifier, item.sortDirection);
            }

            setCurrentItem(newCurrentItem);
            onSelect(newCurrentItem);
        },
        [currentItem, setCurrentItem, onSelect],
    );

    const measureSelectHandler = useCallback(
        (newCurrentItem: ISortItem) => {
            setCurrentItem(newCurrentItem);
            onSelect(newCurrentItem);
        },
        [currentItem, setCurrentItem, onSelect],
    );

    const sortTypeItems = getSortTypeItems(availableSorts, intl);
    const currentType =
        isAttributeSort(currentItem) && !isAttributeAreaSort(currentItem) ? "alphabetical" : "numerical";
    const direction = sortDirection(currentItem);
    const buttonValue = getButtonValue(sortTypeItems, currentType, direction);

    return (
        <>
            <Dropdown
                closeOnMouseDrag
                closeOnParentScroll
                renderButton={({ isOpen, toggleDropdown }) => (
                    <div ref={buttonRef}>
                        <DropdownButton
                            className={`s-sort-type-attribute-button-${index} s-${currentType}-dropdown-button`}
                            value={buttonValue.title}
                            isOpen={isOpen}
                            onClick={toggleDropdown}
                            iconLeft={getIconClassNameBySelection(`${currentType}-${direction}`)}
                        />
                    </div>
                )}
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        className="gd-attribute-sorting-dropdown-body s-attribute-sorting-dropdown-body"
                        items={sortTypeItems}
                        width={width}
                        renderItem={({ item }) => {
                            const isSelected = item.id === `${currentType}-${direction}`;
                            const iconClass = getIconClassNameBySelection(
                                `${item.type}-${item.sortDirection}`,
                            );
                            return (
                                <SingleSelectListItem
                                    isSelected={isSelected}
                                    className={iconClass}
                                    title={item.title}
                                    onClick={() => {
                                        attributeSelectHandler(item);
                                        closeDropdown();
                                    }}
                                />
                            );
                        }}
                    />
                )}
            />

            {/* Inner dropdown with measures/aggregation per currentItem -
                only shown when top attribute is filter by "Largest to smallest" */}
            {currentType === "numerical" && (
                <MeasureDropdown
                    currentItem={currentItem}
                    intl={intl}
                    availableSorts={availableSorts}
                    bucketItemNames={bucketItemNames}
                    onSelect={measureSelectHandler}
                    disabledExplanationTooltip={availableSorts.explanation}
                    enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                />
            )}
        </>
    );
};
