// (C) 2007-2025 GoodData Corporation
import React, { useCallback, useState, useEffect } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Input } from "../Form/index.js";
import { DropdownTabs } from "./DropdownTabs.js";
import { IListProps, List } from "../List/index.js";
import { LoadingMask } from "../LoadingMask/index.js";
import { NoData } from "../NoData/index.js";
import { AutoSize } from "../AutoSize/index.js";
import { ITab } from "../Tabs/index.js";

/**
 * @internal
 */
export interface IDropdownListNoDataRenderProps {
    hasNoMatchingData: boolean;
}

/**
 * @internal
 */
export interface IDropdownListProps<T> extends IListProps<T> {
    title?: string;
    className?: string;
    tabsClassName?: string;

    height?: number;
    width?: number;
    maxHeight?: number;

    isLoading?: boolean;

    showSearch?: boolean;
    disableAutofocus?: boolean;
    searchFieldSize?: "small" | "normal";
    searchPlaceholder?: string;
    searchString?: string;
    searchLabel?: string;
    onSearch?: (searchString: string) => void;

    showTabs?: boolean;
    tabs?: ITab[];
    selectedTabId?: string;
    onTabSelect?: (tab: ITab) => void;

    mobileItemHeight?: number;
    isMobile?: boolean;

    renderNoData?: (props: IDropdownListNoDataRenderProps) => React.ReactNode;
    footer?: React.ReactNode | ((closeDropdown: () => void) => React.ReactNode);
    closeDropdown?: () => void;

    scrollToItem?: T;
}

/**
 * @internal
 */
export const LOADING_HEIGHT = 100;

/**
 * @internal
 */
export const DEFAULT_ITEM_HEIGHT = 28;

/**
 * @internal
 */
export const DEFAULT_MOBILE_ITEM_HEIGHT = 40;

const defaultNoData = injectIntl(
    ({ hasNoMatchingData, intl }: { hasNoMatchingData: boolean } & WrappedComponentProps) => (
        <NoData
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage({ id: "gs.noData.noMatchingData" })}
            noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
        />
    ),
);

/**
 * @internal
 */
export function DropdownList<T>(props: IDropdownListProps<T>): JSX.Element {
    const {
        title,
        className = "",
        tabsClassName = "",

        width,
        height,
        maxHeight,

        isMobile,
        isLoading,

        items = [],
        itemsCount = items.length,
        itemHeight = DEFAULT_ITEM_HEIGHT,
        mobileItemHeight = DEFAULT_MOBILE_ITEM_HEIGHT,

        showSearch,
        disableAutofocus,
        searchString,
        searchLabel,
        searchPlaceholder,
        searchFieldSize,
        onSearch,

        showTabs,
        tabs,
        selectedTabId,
        onTabSelect,

        renderNoData = defaultNoData,

        scrollToItem,
        ...listProps
    } = props;

    const [currentSearchString, setCurrentSearchString] = useState(searchString);
    const hasNoData = !isLoading && itemsCount === 0;
    const hasNoMatchingData = hasNoData && !!currentSearchString;

    const listClassNames = cx("gd-infinite-list", className);

    const searchFieldClassNames = cx("gd-list-searchfield", "gd-flex-item");

    const renderFooter = () => {
        const { footer, closeDropdown } = props;

        if (!footer) {
            return null;
        }

        if (typeof footer === "function") {
            return footer(closeDropdown);
        }

        return footer;
    };

    const onChange = useCallback(
        (search: string | number) => {
            onSearch(search.toString());
            setCurrentSearchString(search.toString());
        },
        [onSearch],
    );

    useEffect(() => {
        // update string if dropdown is not getting unmounted on close to not have previous search on re-open
        setCurrentSearchString(searchString);
    }, [searchString]);

    const onEscKeyPress = useCallback(
        (e) => {
            if (currentSearchString.length > 0) {
                e.stopPropagation();
            }
        },
        [currentSearchString],
    );

    return (
        <React.Fragment>
            {title ? <div className="gd-list-title">{title}</div> : null}
            {showSearch ? (
                <Input
                    className={searchFieldClassNames}
                    value={currentSearchString}
                    onChange={onChange}
                    isSmall={searchFieldSize === "small"}
                    placeholder={searchPlaceholder}
                    clearOnEsc={true}
                    onEscKeyPress={onEscKeyPress}
                    isSearch={true}
                    autofocus={!disableAutofocus}
                    ariaLabel={searchLabel}
                />
            ) : null}
            {showTabs ? (
                <DropdownTabs
                    tabs={tabs}
                    selectedTabId={selectedTabId}
                    onTabSelect={onTabSelect}
                    className={tabsClassName}
                />
            ) : null}
            {hasNoData ? (
                <div style={{ width: isMobile ? "auto" : width }}>{renderNoData({ hasNoMatchingData })}</div>
            ) : null}
            {isLoading ? <LoadingMask width={isMobile ? "100%" : width} height={LOADING_HEIGHT} /> : null}
            {!isLoading && itemsCount > 0 ? (
                <AutoSize>
                    {(autoSize) => {
                        const listWidth = isMobile ? autoSize.width : width;
                        const listHeight = isMobile ? autoSize.height : height;

                        return (
                            <List
                                className={listClassNames}
                                width={listWidth}
                                height={listHeight}
                                maxHeight={maxHeight}
                                items={items}
                                itemsCount={itemsCount}
                                itemHeight={isMobile ? Math.max(mobileItemHeight, itemHeight) : itemHeight}
                                scrollToItem={scrollToItem}
                                {...listProps}
                            />
                        );
                    }}
                </AutoSize>
            ) : null}
            {renderFooter()}
        </React.Fragment>
    );
}
