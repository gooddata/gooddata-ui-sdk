// (C) 2007-2025 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import cx from "classnames";
import DefaultMeasure from "react-measure";

import { LoadingMask } from "../../LoadingMask/index.js";
import { useInvertableSelect } from "./useInvertableSelect.js";
import { InvertableSelectSearchBar } from "./InvertableSelectSearchBar.js";
import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox.js";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar.js";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch.js";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { InvertableSelectItem } from "./InvertableSelectItem.js";
import { defaultImport } from "default-import";
import {
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../@ui/hooks/useListWithActionsKeyboardNavigation.js";
import noop from "lodash/noop.js";
import {
    IInvertableSelectRenderErrorProps,
    IInvertableSelectRenderLoadingProps,
    IInvertableSelectRenderNoDataProps,
    IInvertableSelectRenderSearchBarProps,
    IInvertableSelectRenderStatusBarProps,
} from "./InvertableSelect.js";
import { isEnterKey, isEscapeKey, isSpaceKey } from "../../utils/events.js";
import { UiPagedVirtualList } from "../../@ui/UiPagedVirtualList/UiPagedVirtualList.js";

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

    renderError?: (props: IInvertableSelectRenderErrorProps) => JSX.Element;
    renderLoading?: (props: IInvertableSelectRenderLoadingProps) => JSX.Element;
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => JSX.Element;
    renderNoData?: (props: IInvertableSelectRenderNoDataProps) => JSX.Element;
    renderItem?: (props: IInvertableSelectVirtualisedRenderItemProps<T>) => JSX.Element;
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => JSX.Element;
    renderActions?: (props: IInvertableSelectVirtualisedRenderActionsProps) => JSX.Element;
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
            if (firstSelectedIndex !== -1) {
                setFocusedIndex(firstSelectedIndex);
            } else {
                setFocusedIndex(0);
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
        if (isSingleSelect && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
            if (focusedAction === "questionMark") {
                setFocusedAction(SELECT_ITEM_ACTION);
            } else {
                setFocusedAction("questionMark");
            }
        }
        onKeyboardNavigation(event);
    };

    const itemRenderer = useCallback(
        (item: T): JSX.Element => {
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
                                            className={cx("gd-async-list", className ? className : "")}
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

function defaultError(props: IInvertableSelectRenderErrorProps): JSX.Element {
    const { error } = props;
    return <ErrorComponent message={error?.message} />;
}

function defaultLoading(props: IInvertableSelectRenderLoadingProps): JSX.Element {
    const { height } = props;
    return <LoadingMask height={height} />;
}

function defaultSearchBar(props: IInvertableSelectRenderSearchBarProps): JSX.Element {
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

function defaultNoData(): JSX.Element {
    return <InvertableSelectNoResultsMatch />;
}

function defaultItem<T>(props: IInvertableSelectVirtualisedRenderItemProps<T>): JSX.Element {
    return (
        <InvertableSelectItem
            title={props.title}
            isSelected={props.isSelected}
            onClick={props.isSelected ? props.onDeselect : props.onSelect}
            onOnly={props.onSelectOnly}
        />
    );
}

function defaultStatusBar<T>(props: IInvertableSelectRenderStatusBarProps<T>): JSX.Element {
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

function defaultActions(props: IInvertableSelectVirtualisedRenderActionsProps): JSX.Element {
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
