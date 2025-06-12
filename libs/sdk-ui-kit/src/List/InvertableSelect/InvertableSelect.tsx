// (C) 2007-2025 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import DefaultMeasure from "react-measure";

import { LoadingMask } from "../../LoadingMask/index.js";
import { IRenderListItemProps } from "../List.js";
import { AsyncList } from "../AsyncList.js";
import { useInvertableSelect } from "./useInvertableSelect.js";
import { InvertableSelectSearchBar } from "./InvertableSelectSearchBar.js";
import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox.js";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar.js";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch.js";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { InvertableSelectItem } from "./InvertableSelectItem.js";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

/**
 * Properties of List item component implementation
 *
 * @internal
 */
export interface IInvertableSelectRenderItemProps<T> {
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
        isSingleSelect = false,

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
                title: getItemTitle(item),
                isSelected: getIsItemSelected(item),
            });
        },
        [renderItem, getIsItemSelected, getItemTitle, selectItems, deselectItems, selectOnly],
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
                                            className={cx(className, {
                                                "is-multiselect": !isSingleSelect,
                                            })}
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
            isSmall
        />
    );
}

function defaultNoData(): JSX.Element {
    return <InvertableSelectNoResultsMatch />;
}

function defaultItem<T>(props: IInvertableSelectRenderItemProps<T>): JSX.Element {
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
