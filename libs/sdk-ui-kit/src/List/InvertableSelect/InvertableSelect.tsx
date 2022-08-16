// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";

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
 * @internal
 */
export interface IInvertableSelectRenderItemProps<T> {
    item: T;
    isSelected: boolean;
    onSelect: () => void;
    onDeselect: () => void;
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
export interface IInvertableSelectProps<T> {
    className?: string;
    width?: number;
    height?: number;

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
}

/**
 * @internal
 */
export function InvertableSelect<T>(props: IInvertableSelectProps<T>) {
    const {
        className,
        width,
        height,

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
    } = props;

    const {
        onSelectAllCheckboxChange,
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
        <>
            {renderSearchBar({ onSearch, searchPlaceholder, searchString })}
            {isLoading ? (
                renderLoading({ height })
            ) : error ? (
                renderError({ height, error })
            ) : (
                <>
                    {items.length > 0 && (
                        <div className="gd-list-actions gd-list-actions-invertable">
                            <InvertableSelectAllCheckbox
                                checked={selectionState !== "none"}
                                onChange={onSelectAllCheckboxChange}
                                isFiltered={searchString?.length > 0}
                                totalItemsCount={totalItemsCount}
                                isPartialSelection={selectionState === "partial"}
                                loadedItemsCount={items.length}
                            />
                        </div>
                    )}
                    {items.length > 0 && (
                        <AsyncList
                            className={cx("is-multiselect", className ? className : "")}
                            width={width}
                            height={height}
                            items={items}
                            itemHeight={itemHeight}
                            renderItem={itemRenderer}
                            nextPageItemPlaceholdersCount={nextPageItemPlaceholdersCount}
                            isLoadingNextPage={isLoadingNextPage}
                            onLoadNextPage={onLoadNextPage}
                        />
                    )}
                    {items.length === 0 && renderNoData?.({ height })}
                </>
            )}
            {renderStatusBar({ getItemTitle, isInverted, selectedItems, selectedItemsLimit })}
        </>
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
