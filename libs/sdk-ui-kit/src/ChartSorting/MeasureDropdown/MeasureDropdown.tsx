// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { type IntlShape } from "react-intl";

import {
    type ISortItem,
    type LocalIdRef,
    isAttributeAreaSort,
    isMeasureLocator,
    isMeasureSort,
    newAttributeAreaSort,
    newMeasureSort,
    objRefToString,
    sortDirection,
} from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { Bubble } from "../../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../../Bubble/BubbleHoverTrigger.js";
import { Dropdown } from "../../Dropdown/Dropdown.js";
import { DropdownButton } from "../../Dropdown/DropdownButton.js";
import { DropdownList } from "../../Dropdown/DropdownList.js";
import {
    type IAvailableSortsGroup,
    type IBucketItemDescriptors,
    type IMeasureDropdownValue,
    type IMeasureSortItem,
    type MeasureSortSuggestion,
} from "../types.js";

interface IMeasureDropdownProps {
    currentItem: ISortItem;
    bucketItems: IBucketItemDescriptors;
    availableSorts: IAvailableSortsGroup;
    intl: IntlShape;
    onSelect: (newSortItem: ISortItem) => void;
    index: number;

    disabledExplanationTooltip?: string;
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
            if (!measureLocator) {
                return;
            }
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
    if (isAttributeAreaSort(currentItem)) {
        return {
            id: "aggregation",
            title: intl.formatMessage({ id: "sorting.sum.of.all.measure" }),
        };
    } else if (isMeasureSort(currentItem)) {
        const measureLocator = currentItem.measureSortItem.locators.find(isMeasureLocator);
        if (measureLocator) {
            return {
                id: measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.name ?? "",
                title: measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.name ?? "",
                sequenceNumber:
                    measureNames[measureLocator.measureLocatorItem.measureIdentifier]?.sequenceNumber,
            };
        }
    }

    return {
        id: "",
        title: "",
    };
};

const getMeasureIconClassNameBySelected = (id: string): string => {
    if (id === "aggregation") {
        return "gd-icon-aggregation";
    } else {
        return "gd-icon-metric";
    }
};

export function MeasureDropdown({
    currentItem,
    availableSorts,
    bucketItems,
    intl,
    onSelect,
    index,
    disabledExplanationTooltip,
}: IMeasureDropdownProps) {
    const [width, setWidth] = useState<number>(0);
    const buttonRef = useRef<HTMLInputElement>(null);
    const measures: MeasureSortSuggestion[] = availableSorts.metricSorts ?? [];
    const areaSortEnabled = availableSorts.attributeSort?.areaSortEnabled ?? false;
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
                            disabled
                            iconLeft={getMeasureIconClassNameBySelected(buttonValue.id)}
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
                                    iconLeft={getMeasureIconClassNameBySelected(buttonValue.id)}
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
                                        getMeasureIconClassNameBySelected(item.id),
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
}
