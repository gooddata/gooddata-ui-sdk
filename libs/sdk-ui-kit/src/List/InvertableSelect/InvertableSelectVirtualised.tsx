// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import noop from "lodash/noop.js";
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
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../@ui/hooks/useListWithActionsKeyboardNavigation.js";
import { UiPagedVirtualList } from "../../@ui/UiPagedVirtualList/UiPagedVirtualList.js";
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

    const getItemAdditionalActions = React.useCallback(() => {
        if (isSingleSelect) {
            return ["questionMark"];
        }

        return ["only", "questionMark"];
    }, [isSingleSelect]);

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
        });

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            if (isSingleSelect) {
                if (focusedAction === "questionMark") {
                    setFocusedAction(SELECT_ITEM_ACTION);
                } else {
                    setFocusedAction("questionMark");
                }
            }
        } else {
            setFocusedAction(SELECT_ITEM_ACTION);
        }

        onKeyboardNavigation(event);
    };

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
            });
        },
        [
            renderItem,
            getIsItemSelected,
            getItemTitle,
            selectItems,
            deselectItems,
            selectOnly,
            focusedAction,
            focusedItem,
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

    return (
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
                                            onKeyDown={handleKeyDown}
                                            className={cx("gd-async-list", className || "")}
                                        >
                                            <UiPagedVirtualList
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
            <div className="gd-invertable-select-status-bar">
                {renderStatusBar({ getItemTitle, isInverted, selectedItems, selectedItemsLimit })}
            </div>
        </div>
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
