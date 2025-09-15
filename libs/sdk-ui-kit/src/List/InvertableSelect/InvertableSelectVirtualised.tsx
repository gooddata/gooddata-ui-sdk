// (C) 2007-2025 GoodData Corporation

import React, { ReactElement, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import noop from "lodash/noop.js";
import { useIntl } from "react-intl";
import DefaultMeasure from "react-measure";

import { ErrorComponent } from "@gooddata/sdk-ui";

import {
    IInvertableSelectRenderErrorProps,
    IInvertableSelectRenderLoadingProps,
    IInvertableSelectRenderNoDataProps,
    IInvertableSelectRenderSearchBarProps,
    IInvertableSelectRenderStatusBarProps,
} from "./InvertableSelect.js";
import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox.js";
import { InvertableSelectItem } from "./InvertableSelectItem.js";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch.js";
import { InvertableSelectSearchBar } from "./InvertableSelectSearchBar.js";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar.js";
import { useInvertableSelect } from "./useInvertableSelect.js";
import {
    ListWithActionsFocusStore,
    useFocusWithinContainer,
    useListWithActionsFocusStoreValue,
} from "../../@ui/hooks/useListWithActionsFocus.js";
import {
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../@ui/hooks/useListWithActionsKeyboardNavigation.js";
import { UiPagedVirtualList } from "../../@ui/UiPagedVirtualList/UiPagedVirtualList.js";
import {
    DETAILED_ANNOUNCEMENT_THRESHOLD,
    UiSearchResultsAnnouncement,
} from "../../@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
import { LoadingMask } from "../../LoadingMask/index.js";
import { isEnterKey, isEscapeKey, isSpaceKey } from "../../utils/events.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

const DEFAULT_VISIBLE_ITEMS_COUNT = 10;

/**
 * Properties of List item component implementation
 *
 * @internal
 */
export interface IInvertableSelectVirtualisedRenderItemProps<T> {
    /**
     * Item of list
     */
    item: T;

    /**
     * Title of the item
     */
    title: string;

    /**
     * Indicate that item is selected
     */
    isSelected: boolean;

    /**
     * Indicate which action of the list is focused.
     */
    focusedAction?: string;

    /**
     * Add item to selection callback
     */
    onSelect: () => void;

    /**
     * Remove item from selection
     */
    onDeselect: () => void;

    /**
     * Select item only
     */
    onSelectOnly: () => void;

    /**
     * The ref for the parent list element. Used for focus management.
     */
    listRef?: React.RefObject<HTMLElement>;

    /**
     * The index of the item in the list. Used for accessibility purposes.
     */
    index?: number;

    /**
     * The number of items in the list. Used for accessibility purposes.
     */
    itemsCount?: number;
}

/**
 * @internal
 */
export interface IInvertableSelectVirtualisedRenderActionsProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    onToggle: () => void;
    totalItemsCount: number;
    isFiltered: boolean;
    isPartialSelection: boolean;
    isVisible: boolean;
    onApplyButtonClick?: () => void;
}

/**
 * @internal
 */
export interface IInvertableSelectVirtualisedProps<T> {
    className?: string;
    width?: number;
    height?: number;
    adaptiveWidth?: boolean;
    adaptiveHeight?: boolean;
    isSingleSelect?: boolean;

    items: T[];
    totalItemsCount?: number;
    itemHeight?: number;
    getItemTitle: (item: T) => string;
    getItemKey: (item: T) => string;

    isItemQuestionMarkEnabled?: (item: T) => boolean;

    isInverted: boolean;
    selectedItems: T[];
    selectedItemsLimit?: number;
    onSelect?: (items: T[], isInverted: boolean) => void;
    numberOfHiddenSelectedItems?: number;

    searchString?: string;
    searchPlaceholder?: string;
    onSearch?: (search: string) => void;

    error?: any;

    canSubmitOnKeyDown?: boolean;
    isLoading?: boolean;
    nextPageItemPlaceholdersCount?: number;
    isLoadingNextPage?: boolean;
    onLoadNextPage?: () => void;

    onApplyButtonClick?: () => void;

    renderError?: (props: IInvertableSelectRenderErrorProps) => ReactElement;
    renderLoading?: (props: IInvertableSelectRenderLoadingProps) => ReactElement;
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => ReactElement;
    renderNoData?: (props: IInvertableSelectRenderNoDataProps) => ReactElement;
    renderItem?: (props: IInvertableSelectVirtualisedRenderItemProps<T>) => ReactElement;
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => ReactElement;
    renderActions?: (props: IInvertableSelectVirtualisedRenderActionsProps) => ReactElement;
}

/**
 * @internal
 */
export function InvertableSelectVirtualised<T>(props: IInvertableSelectVirtualisedProps<T>) {
    const {
        className,
        height,
        adaptiveHeight,
        isSingleSelect = false,

        items,
        totalItemsCount,
        itemHeight,

        getItemTitle,
        getItemKey,

        isItemQuestionMarkEnabled = () => true,

        isInverted = true,
        selectedItems,
        selectedItemsLimit = Infinity,

        onSearch,
        searchString,
        searchPlaceholder,

        error,
        isLoading,
        nextPageItemPlaceholdersCount,
        isLoadingNextPage,
        canSubmitOnKeyDown,
        onLoadNextPage,

        onApplyButtonClick,

        renderError = defaultError,
        renderLoading = defaultLoading,
        renderSearchBar = defaultSearchBar,
        renderNoData = defaultNoData,
        renderItem = defaultItem,
        renderStatusBar = defaultStatusBar,
        renderActions = defaultActions,
    } = props;

    const { formatMessage } = useIntl();

    const {
        onSelectAllCheckboxChange,
        onSelectAllCheckboxToggle,
        selectOnly,
        selectItems,
        deselectItems,
        selectionState,
        getIsItemSelected,
    } = useInvertableSelect(props);

    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [hasInitializedFocus, setHasInitializedFocus] = useState<boolean>(false);

    useEffect(() => {
        if (items.length === 0) {
            setFocusedIndex(-1);
            setHasInitializedFocus(false);
        } else if (!hasInitializedFocus) {
            const firstSelectedIndex = items.findIndex((item) => getIsItemSelected(item));
            setHasInitializedFocus(true);
            if (firstSelectedIndex === -1) {
                setFocusedIndex(0);
            } else {
                setFocusedIndex(firstSelectedIndex);
            }
        }
    }, [items, hasInitializedFocus, getIsItemSelected, setFocusedIndex]);

    const handleSelectItem = React.useCallback(
        (item: T, e?: React.KeyboardEvent) => () => {
            if (isSingleSelect) {
                selectOnly(item);
            } else {
                const isSelected = getIsItemSelected(item);

                if (isSpaceKey(e)) {
                    if (isSelected) {
                        deselectItems([item]);
                    } else {
                        selectItems([item]);
                    }
                }

                if (isEnterKey(e) && canSubmitOnKeyDown) {
                    onApplyButtonClick?.();
                }
            }
        },
        [
            isSingleSelect,
            canSubmitOnKeyDown,
            selectOnly,
            getIsItemSelected,
            deselectItems,
            selectItems,
            onApplyButtonClick,
        ],
    );

    const handleSelectOnly = React.useCallback(
        (item: T) => () => {
            if (isSingleSelect) {
                return undefined;
            }
            selectOnly(item);
        },
        [isSingleSelect, selectOnly],
    );

    const getItemAdditionalActions = React.useCallback(
        (item: T) => {
            const questionMark = isItemQuestionMarkEnabled(item) ? ["questionMark"] : [];

            if (isSingleSelect) {
                return [...questionMark];
            }

            return ["only", ...questionMark];
        },
        [isItemQuestionMarkEnabled, isSingleSelect],
    );

    const { onKeyboardNavigation, focusedItem, focusedAction, setFocusedAction } =
        useListWithActionsKeyboardNavigation({
            items,
            getItemAdditionalActions,
            actionHandlers: {
                selectItem: handleSelectItem,
                only: handleSelectOnly,
                questionMark: () => noop,
            },
            focusedIndex,
            isSimple: true,
        });

    const focusStoreValue = useListWithActionsFocusStoreValue(getItemKey);

    const { containerRef } = useFocusWithinContainer(
        focusedItem && focusedAction
            ? focusStoreValue.makeId({ item: focusedItem, action: focusedAction })
            : "",
    );

    const itemRenderer = useCallback(
        (item: T): ReactElement => {
            return renderItem({
                onSelect: () => {
                    selectItems([item]);
                },
                onDeselect: () => {
                    deselectItems([item]);
                },
                onSelectOnly: () => selectOnly(item),
                item,
                title: getItemTitle(item),
                isSelected: getIsItemSelected(item),
                focusedAction: item === focusedItem ? focusedAction : undefined,
                listRef: containerRef,
                index: items.indexOf(item) + 1,
                itemsCount: items.length,
            });
        },
        [
            renderItem,
            getItemTitle,
            getIsItemSelected,
            focusedItem,
            focusedAction,
            containerRef,
            items,
            selectItems,
            deselectItems,
            selectOnly,
        ],
    );

    const handleSearchBarKeyDown = useCallback(
        (e) => {
            if (isEscapeKey(e) && searchString.length > 0) {
                e.stopPropagation();
            }
        },
        [searchString],
    );

    const shouldLoadNextPage = useCallback((lastItemIndex: number, itemsCount: number) => {
        return lastItemIndex >= itemsCount - 1;
    }, []);

    const listRef = React.useRef<{ scrollToItem: (item: unknown) => void }>(null);

    const handleFocus = React.useCallback<React.FocusEventHandler>(
        (e) => {
            if (e.target.id !== focusStoreValue.containerId) {
                return;
            }

            const elementToFocus = document.getElementById(
                focusStoreValue.makeId({ item: focusedItem, action: SELECT_ITEM_ACTION }),
            );

            listRef.current.scrollToItem(focusedItem);

            if (!elementToFocus) {
                return;
            }

            setFocusedAction(SELECT_ITEM_ACTION);
            elementToFocus.focus();
        },
        [focusStoreValue, focusedItem, setFocusedAction],
    );
    const handleBlur = React.useCallback<React.FocusEventHandler>(
        // Select the default action when the focus leaves the list
        (e) => {
            if (containerRef.current.contains(e.relatedTarget)) {
                return;
            }

            setFocusedAction(SELECT_ITEM_ACTION);
        },
        [containerRef, setFocusedAction],
    );

    const hasQuestionMark = items[0] ? isItemQuestionMarkEnabled(items[0]) : false;

    return (
        <ListWithActionsFocusStore value={focusStoreValue}>
            <div className="gd-invertable-select">
                <div className="gd-invertable-select-search-bar" onKeyDown={handleSearchBarKeyDown}>
                    {renderSearchBar({ onSearch, searchPlaceholder, searchString })}
                </div>
                {isLoading ? (
                    <div className="gd-invertable-select-loading">{renderLoading({ height })}</div>
                ) : error ? (
                    <div className="gd-invertable-select-error">{renderError({ height, error })}</div>
                ) : (
                    <>
                        {renderActions({
                            isVisible: items.length > 0,
                            checked: selectionState !== "none",
                            onToggle: onSelectAllCheckboxToggle,
                            onChange: onSelectAllCheckboxChange,
                            isFiltered: searchString?.length > 0,
                            totalItemsCount,
                            isPartialSelection: selectionState === "partial",
                        })}
                        {items.length > 0 && (
                            <Measure client>
                                {({ measureRef, contentRect }) => {
                                    const maxHeight = adaptiveHeight
                                        ? contentRect?.client.height
                                        : Math.min(items.length, DEFAULT_VISIBLE_ITEMS_COUNT) * itemHeight;

                                    return isLoading ? (
                                        <LoadingMask height={height} />
                                    ) : (
                                        <div className="gd-invertable-select-list" ref={measureRef}>
                                            <div
                                                tabIndex={0}
                                                onKeyDown={onKeyboardNavigation}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                className={cx("gd-async-list", className || "")}
                                                ref={containerRef as React.RefObject<HTMLDivElement>}
                                                role={"listbox"}
                                                aria-label={
                                                    hasQuestionMark
                                                        ? formatMessage({
                                                              id: "attributesDropdown.actionsHint.withQuestion",
                                                          })
                                                        : formatMessage({
                                                              id: "attributesDropdown.actionsHint.noQuestion",
                                                          })
                                                }
                                                aria-multiselectable={!isSingleSelect}
                                                id={focusStoreValue.containerId}
                                            >
                                                <UiPagedVirtualList<T>
                                                    items={items}
                                                    itemHeight={itemHeight}
                                                    itemsGap={0}
                                                    itemPadding={0}
                                                    skeletonItemsCount={nextPageItemPlaceholdersCount}
                                                    hasNextPage={nextPageItemPlaceholdersCount > 0}
                                                    loadNextPage={onLoadNextPage}
                                                    isLoading={isLoadingNextPage}
                                                    maxHeight={maxHeight}
                                                    scrollToItem={focusedItem}
                                                    scrollToItemKeyExtractor={getItemKey}
                                                    tabIndex={-1}
                                                    shouldLoadNextPage={shouldLoadNextPage}
                                                    ref={listRef}
                                                >
                                                    {itemRenderer}
                                                </UiPagedVirtualList>
                                            </div>
                                        </div>
                                    );
                                }}
                            </Measure>
                        )}
                        {items.length === 0 && (
                            <div className="gd-invertable-select-no-data">{renderNoData?.({ height })}</div>
                        )}
                    </>
                )}
                <div
                    className="gd-invertable-select-status-bar"
                    aria-label={formatMessage({ id: "attributesDropdown.filterValues" })}
                    role={"status"}
                    aria-live={"off"}
                >
                    {renderStatusBar({ getItemTitle, isInverted, selectedItems, selectedItemsLimit })}
                </div>
                <UiSearchResultsAnnouncement
                    totalResults={searchString && !isLoading ? totalItemsCount : undefined}
                    resultValues={
                        totalItemsCount <= DETAILED_ANNOUNCEMENT_THRESHOLD
                            ? items.map(getItemTitle)
                            : undefined
                    }
                />
            </div>
        </ListWithActionsFocusStore>
    );
}

function defaultError(props: IInvertableSelectRenderErrorProps): ReactElement {
    const { error } = props;
    return <ErrorComponent message={error?.message} />;
}

function defaultLoading(props: IInvertableSelectRenderLoadingProps): ReactElement {
    const { height } = props;
    return <LoadingMask height={height} />;
}

function defaultSearchBar(props: IInvertableSelectRenderSearchBarProps): ReactElement {
    const { onSearch, searchPlaceholder, searchString } = props;
    return (
        <InvertableSelectSearchBar
            searchPlaceholder={searchPlaceholder}
            onSearch={onSearch}
            searchString={searchString}
            isSmall
        />
    );
}

function defaultNoData(): ReactElement {
    return <InvertableSelectNoResultsMatch />;
}

function defaultItem<T>(props: IInvertableSelectVirtualisedRenderItemProps<T>): ReactElement {
    return (
        <InvertableSelectItem
            title={props.title}
            isSelected={props.isSelected}
            onClick={props.isSelected ? props.onDeselect : props.onSelect}
            onOnly={props.onSelectOnly}
            listRef={props.listRef}
        />
    );
}

function defaultStatusBar<T>(props: IInvertableSelectRenderStatusBarProps<T>): ReactElement {
    const { isInverted, selectedItems, getItemTitle, selectedItemsLimit } = props;
    return (
        <InvertableSelectStatusBar
            isInverted={isInverted}
            selectedItems={selectedItems}
            getItemTitle={getItemTitle}
            selectedItemsLimit={selectedItemsLimit}
        />
    );
}

function defaultActions(props: IInvertableSelectVirtualisedRenderActionsProps): ReactElement {
    const { checked, onToggle, onChange, isFiltered, totalItemsCount, isPartialSelection, isVisible } = props;
    return (
        <InvertableSelectAllCheckbox
            isVisible={isVisible}
            checked={checked}
            onChange={onChange}
            onToggle={onToggle}
            isFiltered={isFiltered}
            totalItemsCount={totalItemsCount}
            isPartialSelection={isPartialSelection}
        />
    );
}
