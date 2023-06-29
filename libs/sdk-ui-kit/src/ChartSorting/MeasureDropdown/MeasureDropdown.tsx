// (C) 2022-2023 GoodData Corporation
import React, { useState, useRef, useEffect, useCallback } from "react";
import { IntlShape } from "react-intl";
import cx from "classnames";
import {
    ISortItem,
    isMeasureLocator,
    sortDirection,
    isMeasureSort,
    newAttributeAreaSort,
    newMeasureSort,
    LocalIdRef,
    objRefToString,
    isAttributeAreaSort,
} from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import {
    MeasureSortSuggestion,
    IBucketItemDescriptors,
    IMeasureSortItem,
    IMeasureDropdownValue,
    IAvailableSortsGroup,
} from "../types.js";

import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import { DropdownButton, Dropdown, DropdownList } from "../../Dropdown/index.js";

interface MeasureDropdownProps {
    currentItem: ISortItem;
    bucketItems: IBucketItemDescriptors;
    availableSorts: IAvailableSortsGroup;
    intl: IntlShape;
    onSelect: (newSortItem: ISortItem) => void;
    index: number;

    disabledExplanationTooltip?: string;
    enableRenamingMeasureToMetric?: boolean;
}

const getItems = (
    intl: IntlShape,
    measures: MeasureSortSuggestion[],
    measureNames: IBucketItemDescriptors,
    areaSortEnabled: boolean,
    availableId: LocalIdRef,
): IMeasureSortItem[] => {
    const measureValues: IMeasureSortItem[] = [];

    if (areaSortEnabled) {
        measureValues.push({
            id: "aggregation",
            title: intl.formatMessage({
                id: "sorting.sum.of.all.measure",
            }),
            localIdentifier: objRefToString(availableId),
        });
    }

    if (measures) {
        measures.forEach((measure) => {
            const measureLocator = measure.locators.find(isMeasureLocator);
            const bucketItem = measureNames[measureLocator.measureLocatorItem.measureIdentifier];
            if (bucketItem) {
                measureValues.push({
                    id: measureLocator.measureLocatorItem.measureIdentifier,
                    title: bucketItem?.name,
                    sequenceNumber: bucketItem?.sequenceNumber,
                    localIdentifier: measureLocator.measureLocatorItem.measureIdentifier,
                });
            }
        });
    }

    return measureValues;
};

const getButtonValue = (
    currentItem: ISortItem,
    intl: IntlShape,
    measureNames: IBucketItemDescriptors,
): IMeasureDropdownValue => {
    let buttonValue: IMeasureDropdownValue;
    if (isAttributeAreaSort(currentItem)) {
        buttonValue = {
            id: "aggregation",
            title: intl.formatMessage({ id: "sorting.sum.of.all.measure" }),
        };
    } else if (isMeasureSort(currentItem)) {
        const measureLocator = currentItem.measureSortItem.locators.find(isMeasureLocator);
        buttonValue = {
            id: measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.name,
            title: measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.name,
            sequenceNumber: measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.sequenceNumber,
        };
    }

    return buttonValue;
};

const getMeasureIconClassNameBySelected = (id: string, enableRenamingMeasureToMetric: boolean): string => {
    if (id === "aggregation") {
        return "gd-icon-aggregation";
    } else if (enableRenamingMeasureToMetric) {
        return "gd-icon-metric";
    } else {
        return "gd-icon-measure";
    }
};

export const MeasureDropdown: React.FC<MeasureDropdownProps> = ({
    currentItem,
    availableSorts,
    bucketItems,
    intl,
    onSelect,
    index,
    enableRenamingMeasureToMetric,
    disabledExplanationTooltip,
}) => {
    const [width, setWidth] = useState<number>(0);
    const buttonRef = useRef<HTMLInputElement>();
    const measures: MeasureSortSuggestion[] = availableSorts.metricSorts;
    const areaSortEnabled = availableSorts.attributeSort.areaSortEnabled;
    const items = getItems(intl, measures, bucketItems, areaSortEnabled, availableSorts.itemId);
    const disableDropdown = items.length === 1;
    const buttonValue = getButtonValue(currentItem, intl, bucketItems);
    const measureName = buttonValue.sequenceNumber
        ? `${buttonValue.title} (${buttonValue.sequenceNumber})`
        : buttonValue.title;

    useEffect(() => {
        if (buttonRef?.current) {
            setWidth(buttonRef.current.getBoundingClientRect().width);
        }
    }, []);

    const onMeasureSelectHandler = useCallback(
        (item: IMeasureSortItem) => {
            const direction = sortDirection(currentItem);

            if (item.id === "aggregation" && areaSortEnabled) {
                onSelect(newAttributeAreaSort(item.localIdentifier, direction));
            } else {
                onSelect(newMeasureSort(item.localIdentifier, direction));
            }
        },
        [currentItem, onSelect, areaSortEnabled],
    );

    return (
        <div className="sort-measure-section">
            <span className="select-label">
                <span>{intl.formatMessage({ id: "sorting.by" })}</span>
            </span>
            <div className="measure-sorting-dropdown">
                {disableDropdown ? (
                    <BubbleHoverTrigger>
                        <DropdownButton
                            className="s-inner-aggregation-disabled-button s-measure-dropdown-button"
                            value={measureName}
                            disabled={true}
                            iconLeft={getMeasureIconClassNameBySelected(
                                buttonValue.id,
                                enableRenamingMeasureToMetric,
                            )}
                        />
                        {disabledExplanationTooltip ? (
                            <Bubble alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}>
                                {/* TODO: TNT-466 - Tooltip explanation message provided by PV  */}
                            </Bubble>
                        ) : null}
                    </BubbleHoverTrigger>
                ) : (
                    <Dropdown
                        className="gd-measure-sorting-dropdown-body s-measure-sorting-dropdown-body"
                        closeOnMouseDrag
                        closeOnParentScroll
                        renderButton={({ isOpen, toggleDropdown }) => (
                            <div ref={buttonRef}>
                                <DropdownButton
                                    className={`s-sort-type-measure-button s-measure-dropdown-button-${index}`}
                                    value={measureName}
                                    isOpen={isOpen}
                                    disabled={disableDropdown}
                                    onClick={toggleDropdown}
                                    iconLeft={getMeasureIconClassNameBySelected(
                                        buttonValue.id,
                                        enableRenamingMeasureToMetric,
                                    )}
                                />
                            </div>
                        )}
                        renderBody={({ closeDropdown }) => (
                            <DropdownList
                                width={width}
                                items={items}
                                className="gd-measure-sorting-dropdown-body s-measure-sorting-dropdown-body"
                                renderItem={({ item, rowIndex }) => {
                                    const isSelected =
                                        item.title === buttonValue.title &&
                                        item.sequenceNumber === buttonValue.sequenceNumber;
                                    const className = cx(
                                        "gd-list-item",
                                        "gd-list-item-shortened",
                                        "gd-sorting-measure",
                                        "gd-button-link",
                                        getMeasureIconClassNameBySelected(
                                            item.id,
                                            enableRenamingMeasureToMetric,
                                        ),
                                        {
                                            "is-selected": isSelected,
                                        },
                                        `s-sorting-measure-${stringUtils.simplifyText(item.title)}`,
                                        `s-sorting-measure-${rowIndex}`,
                                    );

                                    return (
                                        <div className="gd-measure-dropdown-list">
                                            <button
                                                className={className}
                                                onClick={() => {
                                                    onMeasureSelectHandler(item);
                                                    closeDropdown();
                                                }}
                                                title={item.title}
                                            >
                                                <span className="gd-sorting-measure-title">{item.title}</span>
                                                {item.sequenceNumber ? (
                                                    <span className="gd-sorting-sequence-number">
                                                        {item.sequenceNumber}
                                                    </span>
                                                ) : null}
                                            </button>
                                        </div>
                                    );
                                }}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    );
};
