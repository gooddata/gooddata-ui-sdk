// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import DefaultMeasure from "react-measure";

import { ErrorComponent } from "@gooddata/sdk-ui";

import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox.js";
import { InvertableSelectItem } from "./InvertableSelectItem.js";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch.js";
import { InvertableSelectSearchBar } from "./InvertableSelectSearchBar.js";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar.js";
import { useInvertableSelect } from "./useInvertableSelect.js";
import { LoadingMask } from "../../LoadingMask/index.js";
import { AsyncList } from "../AsyncList.js";
import { IRenderListItemProps } from "../List.js";

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

    renderError?: (props: IInvertableSelectRenderErrorProps) => ReactElement;
    renderLoading?: (props: IInvertableSelectRenderLoadingProps) => ReactElement;
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => ReactElement;
    renderNoData?: (props: IInvertableSelectRenderNoDataProps) => ReactElement;
    renderItem?: (props: IInvertableSelectRenderItemProps<T>) => ReactElement;
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => ReactElement;
    renderActions?: (props: IInvertableSelectRenderActionsProps) => ReactElement;
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
        ({ item }: IRenderListItemProps<T>): ReactElement => {
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

function defaultItem<T>(props: IInvertableSelectRenderItemProps<T>): ReactElement {
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

function defaultActions(props: IInvertableSelectRenderActionsProps): ReactElement {
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
