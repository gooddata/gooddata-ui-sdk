// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import Measure from "react-measure";

import { LoadingMask } from "../../LoadingMask";
import { IRenderListItemProps } from "../List";
import { AsyncList } from "../AsyncList";
import { useInvertableSelect } from "./useInvertableSelect";
import { InvertableSelectSearchBar } from "./InvertableSelectSearchBar";
import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { InvertableSelectItem } from "./InvertableSelectItem";

/**
 * Properties of List item component implementation
 *
 * @beta
 */
export interface IInvertableSelectRenderItemProps<T> {
    /**
     * Item of list
     *
     * @beta
     */
    item: T;

    /**
     * Indicate that item is selected
     *
     * @beta
     */
    isSelected: boolean;

    /**
     * Add item to selection callback
     *
     * @beta
     */
    onSelect: () => void;

    /**
     * Remove item from selection
     *
     * @beta
     */
    onDeselect: () => void;

    /**
     * Select item only
     *
     * @beta
     */
    onSelectOnly: () => void;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderLoadingProps {
    height?: number;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderErrorProps {
    error?: any;
    height?: number;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderNoDataProps {
    error?: any;
    height?: number;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderSearchBarProps {
    searchString?: string;
    searchPlaceholder?: string;
    onSearch: (searchString: string) => void;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderStatusBarProps<T> {
    isInverted: boolean;
    getItemTitle: (item: T) => string;
    selectedItems: T[];
    selectedItemsLimit?: number;
}

/**
 * @internal
 */
export interface IInvertableSelectRenderActionsProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    onToggle: () => void;
    totalItemsCount: number;
    isFiltered: boolean;
    isPartialSelection: boolean;
    isVisible: boolean;
}

/**
 * @internal
 */
export interface IInvertableSelectProps<T> {
    className?: string;
    width?: number;
    height?: number;
    adaptiveWidth?: boolean;
    adaptiveHeight?: boolean;

    items: T[];
    totalItemsCount?: number;
    itemHeight?: number;
    getItemTitle: (item: T) => string;
    getItemKey: (item: T) => string;

    isInverted: boolean;
    selectedItems: T[];
    selectedItemsLimit?: number;
    onSelect?: (items: T[], isInverted: boolean) => void;

    searchString?: string;
    searchPlaceholder?: string;
    onSearch?: (search: string) => void;

    error?: any;

    isLoading?: boolean;
    nextPageItemPlaceholdersCount?: number;
    isLoadingNextPage?: boolean;
    onLoadNextPage?: () => void;

    renderError?: (props: IInvertableSelectRenderErrorProps) => JSX.Element;
    renderLoading?: (props: IInvertableSelectRenderLoadingProps) => JSX.Element;
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => JSX.Element;
    renderNoData?: (props: IInvertableSelectRenderNoDataProps) => JSX.Element;
    renderItem?: (props: IInvertableSelectRenderItemProps<T>) => JSX.Element;
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => JSX.Element;
    renderActions?: (props: IInvertableSelectRenderActionsProps) => JSX.Element;
}

/**
 * @internal
 */
export function InvertableSelect<T>(props: IInvertableSelectProps<T>) {
    const {
        className,
        width,
        height,
        adaptiveWidth,
        adaptiveHeight,

        items,
        totalItemsCount,
        itemHeight,

        getItemTitle,

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
        onLoadNextPage,

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

    const itemRenderer = useCallback(
        ({ item }: IRenderListItemProps<T>): JSX.Element => {
            return renderItem({
                onSelect: () => {
                    selectItems([item]);
                },
                onDeselect: () => {
                    deselectItems([item]);
                },
                onSelectOnly: () => selectOnly(item),
                item,
                isSelected: getIsItemSelected(item),
            });
        },
        [renderItem, getIsItemSelected, selectItems, deselectItems, selectOnly],
    );

    return (
        <div className="gd-invertable-select">
            <div className="gd-invertable-select-search-bar">
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
                                return (
                                    <div className="gd-invertable-select-list" ref={measureRef}>
                                        <AsyncList
                                            className={cx(["is-multiselect", className])}
                                            width={adaptiveWidth ? contentRect?.client.width : width}
                                            height={
                                                adaptiveHeight
                                                    ? contentRect?.client.height
                                                    : Math.min(items.length, 10) * itemHeight
                                            }
                                            items={items}
                                            itemHeight={itemHeight}
                                            renderItem={itemRenderer}
                                            nextPageItemPlaceholdersCount={nextPageItemPlaceholdersCount}
                                            isLoadingNextPage={isLoadingNextPage}
                                            onLoadNextPage={onLoadNextPage}
                                        />
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
        />
    );
}

function defaultNoData(): JSX.Element {
    return <InvertableSelectNoResultsMatch />;
}

function defaultItem<T>(props: IInvertableSelectRenderItemProps<T>): JSX.Element {
    return <InvertableSelectItem {...props} />;
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

function defaultActions(props: IInvertableSelectRenderActionsProps): JSX.Element {
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
