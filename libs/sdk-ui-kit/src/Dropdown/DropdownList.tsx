// (C) 2007-2025 GoodData Corporation

import { Fragment, ReactElement, ReactNode, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { DropdownTabs } from "./DropdownTabs.js";
import { UiPagedVirtualList } from "../@ui/UiPagedVirtualList/UiPagedVirtualList.js";
import {
    DETAILED_ANNOUNCEMENT_THRESHOLD,
    UiSearchResultsAnnouncement,
} from "../@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
import { AutoSize } from "../AutoSize/index.js";
import { Input } from "../Form/index.js";
import { IListProps, List } from "../List/index.js";
import { LoadingMask } from "../LoadingMask/index.js";
import { NoData } from "../NoData/index.js";
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

    renderVirtualisedList?: boolean;
    onKeyDownSelect?: (item: T) => void;

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

    renderNoData?: (props: IDropdownListNoDataRenderProps) => ReactNode;
    footer?: ReactNode | ((closeDropdown: () => void) => ReactNode);
    closeDropdown?: () => void;

    scrollToItem?: T;
    scrollDirection?: -1 | 1;
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

function DefaultNoData({ hasNoMatchingData }: { hasNoMatchingData: boolean }) {
    const intl = useIntl();

    return (
        <NoData
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage({ id: "gs.noData.noMatchingData" })}
            noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
        />
    );
}

/**
 * @internal
 *
 * This component currently supports rendering both legacy and modern list implementations,
 * but there is an opportunity to simplify and improve maintainability by splitting it.
 *
 * TODO: Consider splitting this component into two separate implementations:
 *
 * 1. `List` — Maintained temporarily for backward compatibility with existing consumers that rely on
 *    the legacy `List` implementation based on `fixed-data-table-2`.
 *
 * 2. `UiPagedVirtualised` — Preferred implementation that uses our `UiPagedVirtualList` component
 */
export function DropdownList<T>({
    title,
    className = "",
    tabsClassName = "",

    width,
    height,
    maxHeight,

    renderVirtualisedList = false,
    onKeyDownSelect,

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

    renderNoData = DefaultNoData,
    footer,
    closeDropdown,

    scrollToItem,
    scrollDirection,
    ...listProps
}: IDropdownListProps<T>): ReactElement {
    const [currentSearchString, setCurrentSearchString] = useState(searchString);
    const hasNoData = !isLoading && itemsCount === 0;
    const hasNoMatchingData = hasNoData && !!currentSearchString;

    const listClassNames = cx("gd-infinite-list", className);

    const searchFieldClassNames = cx("gd-list-searchfield", "gd-flex-item");

    const renderFooter = () => {
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

    const onEscKeyPress = useCallback(
        (e) => {
            if (currentSearchString.length > 0) {
                e.stopPropagation();
            }
        },
        [currentSearchString],
    );

    useEffect(() => {
        // update string if dropdown is not getting unmounted on close to not have previous search on re-open
        setCurrentSearchString(searchString);
    }, [searchString]);

    return (
        <Fragment>
            {title ? <div className="gd-list-title">{title}</div> : null}
            {showSearch ? (
                <>
                    <Input
                        className={searchFieldClassNames}
                        value={currentSearchString}
                        onChange={onChange}
                        isSmall={searchFieldSize === "small"}
                        placeholder={searchPlaceholder}
                        clearOnEsc
                        onEscKeyPress={onEscKeyPress}
                        isSearch
                        autofocus={!disableAutofocus}
                        accessibilityConfig={{
                            ariaLabel: searchLabel,
                        }}
                    />
                    <UiSearchResultsAnnouncement
                        totalResults={currentSearchString ? itemsCount : undefined}
                        resultValues={
                            itemsCount <= DETAILED_ANNOUNCEMENT_THRESHOLD && listProps.itemTitleGetter
                                ? items.map(listProps.itemTitleGetter)
                                : undefined
                        }
                    />
                </>
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
                <div style={{ width: isMobile ? "auto" : width }}>
                    {renderNoData({ hasNoMatchingData }) as ReactNode}
                </div>
            ) : null}
            {isLoading ? <LoadingMask width={isMobile ? "100%" : width} height={LOADING_HEIGHT} /> : null}
            {!isLoading && itemsCount > 0 ? (
                <AutoSize>
                    {(autoSize) => {
                        const listWidth = isMobile ? autoSize.width : width;
                        const listHeight = isMobile ? autoSize.height : height;
                        const effectiveItemHeight = isMobile
                            ? Math.max(mobileItemHeight, itemHeight)
                            : itemHeight;
                        const effectiveMaxHeight = maxHeight || listHeight || 300;

                        return renderVirtualisedList ? (
                            <div style={{ width: listWidth }} className={listClassNames}>
                                <UiPagedVirtualList
                                    maxHeight={effectiveMaxHeight}
                                    items={items}
                                    itemHeight={effectiveItemHeight}
                                    itemsGap={0}
                                    itemPadding={0}
                                    skeletonItemsCount={0}
                                    onKeyDownSelect={onKeyDownSelect}
                                    closeDropdown={closeDropdown}
                                >
                                    {(item) => {
                                        const rowIndex = items.indexOf(item);
                                        const listWidth = isMobile ? autoSize.width : width;
                                        return listProps.renderItem({
                                            rowIndex,
                                            item,
                                            width: listWidth,
                                            height: effectiveItemHeight,
                                            isFirst: rowIndex === 0,
                                            isLast: rowIndex === itemsCount - 1,
                                        });
                                    }}
                                </UiPagedVirtualList>
                            </div>
                        ) : (
                            <List
                                className={listClassNames}
                                width={listWidth}
                                height={listHeight}
                                maxHeight={maxHeight}
                                items={items}
                                itemsCount={itemsCount}
                                itemHeight={isMobile ? Math.max(mobileItemHeight, itemHeight) : itemHeight}
                                scrollToItem={scrollToItem}
                                scrollDirection={scrollDirection}
                                {...listProps}
                            />
                        );
                    }}
                </AutoSize>
            ) : null}
            {renderFooter()}
        </Fragment>
    );
}
