// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { type Subscription } from "rxjs";

import {
    Button,
    DATE_DATASET_LIST_ITEM_CLASSNAME,
    DateDatasetsListItem,
    Dropdown,
    DropdownButton,
    DropdownList,
    type IDateDatasetHeader,
    UiAsyncTableScrollbarWidth,
    isDateDatasetHeader,
    sortDateDatasets,
    unrelatedHeader,
} from "@gooddata/sdk-ui-kit";

import { type IDecoratedDateDataset } from "../../../models/decorated_date_dataset.js";
import {
    DROPDOWN_ALIGN_POINTS,
    getDateConfigurationDropdownHeight,
    getDateDatasetDropdownWidth,
    subscribeEvents,
} from "../../../utils/dropdown.js";

export interface IDateDatasetsDropdownProps {
    className?: string;

    dateDatasets: ReadonlyArray<IDecoratedDateDataset>;
    activeDateDataset: IDecoratedDateDataset;

    itemHeight: number;
    defaultDialogHeight?: number;

    unavailableCount: number;
    onDateDatasetChange: (item: IDecoratedDateDataset) => void;

    isDateDatasetsDropdownLoaded: boolean;
    onOpenStateChanged: (isOpen: boolean) => void;

    enableUnavailableItemsVisibility: boolean;
}

interface IDateDatasetsDropdownState {
    width: number;
    height: number;
}

const LIST_MAX_HEIGHT = 115;

function measureLongestItemWidth(titles: string[]): number {
    if (titles.length === 0) {
        return 0;
    }

    const probe = document.createElement("div");
    probe.className = `${DATE_DATASET_LIST_ITEM_CLASSNAME} is-selected s-date-dataset-width-probe`;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.top = "-9999px";
    probe.style.left = "-9999px";

    const text = document.createElement("span");
    text.className = "shortened is-whole";
    probe.appendChild(text);
    document.body.appendChild(probe);

    let maxWidth = 0;
    for (const title of titles) {
        text.textContent = title;
        maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
    }

    document.body.removeChild(probe);

    return Math.ceil(maxWidth);
}

const dateDataSetWithUnrelatedGroup = (
    dateDatasets: ReadonlyArray<IDecoratedDateDataset | IDateDatasetHeader>,
    withUnrelatedGroup = false,
) => {
    const availableItems = dateDatasets.filter(
        (item) =>
            (item as IDecoratedDateDataset).isAvailable || (item as IDateDatasetHeader).type === "header",
    );
    const unavailableItems = (dateDatasets as IDecoratedDateDataset[]).filter((item) => !item.isAvailable);
    if (withUnrelatedGroup && unavailableItems && unavailableItems.length > 0) {
        return [...availableItems, unrelatedHeader, ...unavailableItems];
    }
    return availableItems;
};
export function DateDatasetsDropdown({
    className = "s-date-dataset-switch",
    defaultDialogHeight = 0,
    itemHeight,
    activeDateDataset,
    unavailableCount,
    dateDatasets,
    onDateDatasetChange,
    onOpenStateChanged,
    isDateDatasetsDropdownLoaded,
    enableUnavailableItemsVisibility,
}: IDateDatasetsDropdownProps) {
    const intl = useIntl();
    const [showUnavailableItems, setShowUnavailableItems] = useState(!activeDateDataset.isAvailable);
    const sortedItemsWithUnrelatedGroup = useMemo(() => {
        const mappedDateDatasets = dateDatasets.map((dateDataset) => ({
            ...dateDataset,
            id: dateDataset.identifier,
        }));
        const sortedItems = sortDateDatasets(mappedDateDatasets);
        return dateDataSetWithUnrelatedGroup(
            sortedItems,
            enableUnavailableItemsVisibility && showUnavailableItems,
        );
    }, [dateDatasets, enableUnavailableItemsVisibility, showUnavailableItems]);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [{ height, width }, setDropdownDimensions] = useState<IDateDatasetsDropdownState>({
        width: 0,
        height: defaultDialogHeight,
    });
    const dropdownBodyHeight = sortedItemsWithUnrelatedGroup.length * itemHeight;

    const dimensionInputsRef = useRef({ dropdownBodyHeight, unavailableCount });
    dimensionInputsRef.current = { dropdownBodyHeight, unavailableCount };
    const contentWidthRef = useRef(0);

    const recalculateDimensions = useCallback(() => {
        if (!buttonRef.current) {
            return;
        }
        const { dropdownBodyHeight: bodyHeight, unavailableCount: unavailCount } = dimensionInputsRef.current;
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const calculatedWidth = getDateDatasetDropdownWidth(
            buttonRect.width,
            contentWidthRef.current,
            buttonRect.left,
            buttonRect.right,
        );
        const calculatedHeight = getDateConfigurationDropdownHeight(
            buttonRect.top,
            buttonRect.height,
            bodyHeight,
            unavailCount > 0,
        );
        setDropdownDimensions({ width: calculatedWidth, height: calculatedHeight });
    }, []);

    useLayoutEffect(() => {
        const titles = sortedItemsWithUnrelatedGroup.map((item) =>
            isDateDatasetHeader(item) ? intl.formatMessage({ id: item.title }) : item.title,
        );
        const measuredWidth = measureLongestItemWidth(titles);
        contentWidthRef.current =
            dropdownBodyHeight > LIST_MAX_HEIGHT ? measuredWidth + UiAsyncTableScrollbarWidth : measuredWidth;
        recalculateDimensions();
    }, [
        isDateDatasetsDropdownLoaded,
        dropdownBodyHeight,
        unavailableCount,
        sortedItemsWithUnrelatedGroup,
        intl,
        recalculateDimensions,
    ]);

    const subscribersRef = useRef<Subscription[]>(null);
    useEffect(() => {
        subscribersRef.current = subscribeEvents(recalculateDimensions);

        return () => {
            subscribersRef.current?.forEach((subscriber) => {
                subscriber.unsubscribe();
            });
            subscribersRef.current = null;
        };
    }, [recalculateDimensions]);

    const handleDropdownOpen = (isOpen: boolean) => {
        onOpenStateChanged(isOpen);
        setShowUnavailableItems(!activeDateDataset.isAvailable);
    };

    const handleShowUnrelatedDateClick = () => {
        setShowUnavailableItems(!showUnavailableItems);
    };

    return (
        <Dropdown
            className={className}
            closeOnMouseDrag
            closeOnParentScroll
            alignPoints={DROPDOWN_ALIGN_POINTS}
            onOpenStateChanged={handleDropdownOpen}
            renderButton={({ isOpen, toggleDropdown }) => {
                const className = classNames("s-date-dataset-button", isOpen ? "s-expanded" : "s-collapsed");

                return (
                    <div
                        ref={(ref) => {
                            if (ref && ref !== buttonRef.current) {
                                buttonRef.current = ref;
                            }
                        }}
                    >
                        <DropdownButton
                            id="date-dataset-dropdown"
                            className={className}
                            value={activeDateDataset.title}
                            isOpen={isOpen}
                            onClick={toggleDropdown}
                        />
                    </div>
                );
            }}
            renderBody={({ closeDropdown, isMobile }) => (
                <div style={{ width }}>
                    <DropdownList
                        className="adi-date-datasets-list s-date-datasets-list"
                        isMobile={isMobile}
                        height={height}
                        width={width}
                        itemHeight={itemHeight}
                        maxHeight={LIST_MAX_HEIGHT}
                        items={sortedItemsWithUnrelatedGroup}
                        itemsCount={sortedItemsWithUnrelatedGroup.length}
                        isLoading={!isDateDatasetsDropdownLoaded}
                        renderItem={({ item, width: itemWidth }) => {
                            const isDateHeader = isDateDatasetHeader(item);
                            const isSelected =
                                !isDateHeader && activeDateDataset?.identifier === item?.identifier;

                            return (
                                <DateDatasetsListItem
                                    title={isDateHeader ? intl.formatMessage({ id: item.title }) : item.title}
                                    isHeader={isDateHeader}
                                    isSelected={isSelected}
                                    width={itemWidth}
                                    onClick={(e) => {
                                        if (!isDateHeader) {
                                            e.preventDefault();
                                            closeDropdown();
                                            onDateDatasetChange(item);
                                        }
                                    }}
                                    isUnrelated={!(item as IDecoratedDateDataset).isAvailable}
                                />
                            );
                        }}
                    />
                    {unavailableCount > 0 && isDateDatasetsDropdownLoaded ? (
                        <div className="gd-list-footer">
                            <FormattedMessage
                                id={
                                    enableUnavailableItemsVisibility
                                        ? defineMessage({
                                              id: "date.date-dataset.unrelated_hidden_with_button",
                                          }).id
                                        : defineMessage({ id: "date.date-dataset.unrelated_hidden" }).id
                                }
                                values={{ count: unavailableCount, isShow: showUnavailableItems }}
                            />

                            {enableUnavailableItemsVisibility ? (
                                <Button
                                    onClick={handleShowUnrelatedDateClick}
                                    className="gd-button-link-dimmed unrelated-date-button"
                                    value={intl.formatMessage(
                                        showUnavailableItems
                                            ? defineMessage({ id: "date.date-dataset.unavailableItems.hide" })
                                            : defineMessage({
                                                  id: "date.date-dataset.unavailableItems.show",
                                              }),
                                    )}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            )}
        />
    );
}
