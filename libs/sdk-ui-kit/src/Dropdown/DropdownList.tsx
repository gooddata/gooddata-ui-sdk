// (C) 2007-2026 GoodData Corporation

import {
    type ComponentType,
    Fragment,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react";

import cx from "classnames";
import { type WrappedComponentProps, injectIntl } from "react-intl";

import { DropdownTabs } from "./DropdownTabs.js";
import {
    type IUiPagedVirtualListSkeletonItemProps,
    UiPagedVirtualList,
} from "../@ui/UiPagedVirtualList/UiPagedVirtualList.js";
import {
    DETAILED_ANNOUNCEMENT_THRESHOLD,
    UiSearchResultsAnnouncement,
} from "../@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
import { AutoSize } from "../AutoSize/AutoSize.js";
import { Input } from "../Form/Input.js";
import { LoadingMask } from "../LoadingMask/LoadingMask.js";
import { NoData } from "../NoData/NoData.js";
import { type ITab } from "../Tabs/Tabs.js";
import { type IAccessibilityConfigBase } from "../typings/accessibility.js";
import { isTypingKey } from "../utils/events.js";

/**
 * @internal
 */
export interface IDropdownListNoDataRenderProps {
    hasNoMatchingData: boolean;
}

/**
 * @internal
 */
export interface IRenderDropdownListItemProps<T> {
    rowIndex: number;
    item: T;
    width: number;
    height: number;
    isFirst: boolean;
    isLast: boolean;
    focused?: boolean;
}

/**
 * @internal
 */
export interface IDropdownListProps<T> {
    id?: string;
    items?: T[];
    itemHeight?: number;
    itemsCount?: number;

    title?: string;
    className?: string;
    tabsClassName?: string;

    height?: number;
    width?: number;
    maxHeight?: number;
    containerPadding?: number;

    onKeyDownSelect?: (item: T) => void;
    onKeyDownConfirm?: (item: T) => void;

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

    loadNextPage?: () => void;
    hasNextPage?: boolean;
    skeletonItemsCount?: number;
    shouldLoadNextPage?: (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) => boolean;
    isNextPageLoading?: boolean;
    SkeletonItem?: ComponentType<IUiPagedVirtualListSkeletonItemProps>;

    renderItem: (props: IRenderDropdownListItemProps<T>) => ReactElement;
    itemHeightGetter?: (index: number) => number;
    itemTitleGetter?: (item: T) => string;

    accessibilityConfig?: Pick<IAccessibilityConfigBase, "ariaLabel" | "ariaLabelledBy" | "role">;

    onScroll?: () => void;

    /**
     * An item in the list that should be scrolled into view when the component renders.
     * By default, items are compared by object identity (i.e., ===).
     * To customize how the target item is found (e.g., by ID), provide a `scrollToItemKeyExtractor` as well.
     */
    scrollToItem?: T;
    /**
     * A function that extracts a unique key from each item for comparison with `scrollToItem`.
     * This is useful when the provided `scrollToItem` may not be the same object reference as items in the list.
     * If not provided, object identity (===) is used for comparison.
     */
    scrollToItemKeyExtractor?: (item: T) => string | number;
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

type DefaultNoDataProps = (props: { hasNoMatchingData: boolean }) => ReactNode;

const DefaultNoDataComponent = injectIntl(
    ({ hasNoMatchingData, intl }: { hasNoMatchingData: boolean } & WrappedComponentProps) => (
        <NoData
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage({ id: "gs.noData.noMatchingData" })}
            noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
        />
    ),
);

const defaultNoData: DefaultNoDataProps = (props) => {
    return <DefaultNoDataComponent hasNoMatchingData={props.hasNoMatchingData} />;
};

/**
 * Dropdown list component with paged virtual list implementation
 * @internal
 *
 */
export function DropdownList<T>({
    id,
    title,
    className = "",
    tabsClassName = "",

    width,
    height,
    maxHeight,

    onKeyDownSelect,
    onKeyDownConfirm,

    isMobile,
    isLoading,

    items = [],
    itemsCount = items.length,
    itemHeight = DEFAULT_ITEM_HEIGHT,
    containerPadding = 0,
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
    footer,
    closeDropdown,
    accessibilityConfig,
    renderItem,
    itemHeightGetter,
    itemTitleGetter,
    loadNextPage,
    hasNextPage,
    skeletonItemsCount = 0,
    shouldLoadNextPage,
    isNextPageLoading = false,
    SkeletonItem,
    onScroll,
    scrollToItem,
    scrollToItemKeyExtractor,
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
            return footer(closeDropdown!);
        }

        return footer;
    };

    const onChange = useCallback(
        (search: string | number) => {
            onSearch?.(search.toString());
            setCurrentSearchString(search.toString());
        },
        [onSearch],
    );

    const searchFilled = (currentSearchString ?? "").length > 0;
    const onEscKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (searchFilled) {
                e.stopPropagation();
            } else {
                closeDropdown?.();
            }
        },
        [searchFilled, closeDropdown],
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
                    <div
                        style={{ display: "contents" }}
                        onKeyDown={(e) => {
                            if (isTypingKey(e)) {
                                e.stopPropagation();
                            }
                        }}
                    >
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
                    </div>
                    <UiSearchResultsAnnouncement
                        totalResults={currentSearchString ? itemsCount : undefined}
                        resultValues={
                            itemsCount <= DETAILED_ANNOUNCEMENT_THRESHOLD && itemTitleGetter
                                ? items.map(itemTitleGetter)
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
                <div style={{ width: isMobile ? "auto" : width }}>{renderNoData({ hasNoMatchingData })}</div>
            ) : null}
            {isLoading ? <LoadingMask width={isMobile ? "100%" : width} height={LOADING_HEIGHT} /> : null}
            {!isLoading && itemsCount > 0 ? (
                <AutoSize>
                    {(autoSize) => {
                        const listWidth = isMobile ? autoSize.width : (width ?? (autoSize.width || 200));
                        const listHeight = isMobile ? autoSize.height : height;
                        const effectiveItemHeight = isMobile
                            ? Math.max(mobileItemHeight, itemHeight)
                            : itemHeight;
                        const effectiveMaxHeight = maxHeight || listHeight || 300;

                        return (
                            <div
                                data-testid="gd-dropdown-list"
                                id={id}
                                style={{ width: listWidth }}
                                className={listClassNames}
                                role={
                                    accessibilityConfig?.role === "listbox"
                                        ? undefined
                                        : accessibilityConfig?.role
                                }
                                aria-labelledby={
                                    accessibilityConfig?.role === "listbox"
                                        ? undefined
                                        : accessibilityConfig?.ariaLabelledBy
                                }
                            >
                                <UiPagedVirtualList<T>
                                    maxHeight={effectiveMaxHeight}
                                    items={items}
                                    itemHeight={effectiveItemHeight}
                                    itemsGap={0}
                                    itemPadding={0}
                                    containerPadding={containerPadding}
                                    onKeyDownSelect={onKeyDownSelect}
                                    onKeyDownConfirm={onKeyDownConfirm}
                                    closeDropdown={closeDropdown}
                                    itemHeightGetter={itemHeightGetter}
                                    hasNextPage={hasNextPage}
                                    loadNextPage={loadNextPage}
                                    skeletonItemsCount={skeletonItemsCount}
                                    SkeletonItem={SkeletonItem}
                                    shouldLoadNextPage={shouldLoadNextPage}
                                    isLoading={isNextPageLoading}
                                    onScroll={onScroll}
                                    scrollToItem={scrollToItem}
                                    scrollToItemKeyExtractor={scrollToItemKeyExtractor}
                                    representAs={
                                        accessibilityConfig?.role === "listbox" ? "listbox" : undefined
                                    }
                                    listboxProps={
                                        accessibilityConfig?.role === "listbox"
                                            ? {
                                                  "aria-label": accessibilityConfig?.ariaLabel,
                                                  "aria-labelledby": accessibilityConfig?.ariaLabelledBy,
                                              }
                                            : undefined
                                    }
                                >
                                    {(item) => {
                                        const rowIndex = items.indexOf(item);
                                        const rowHeight = itemHeightGetter?.(rowIndex) ?? effectiveItemHeight;
                                        const listWidth = isMobile
                                            ? autoSize.width
                                            : (width ?? (autoSize.width || 200));
                                        return renderItem({
                                            rowIndex,
                                            item,
                                            width: listWidth,
                                            height: rowHeight,
                                            isFirst: rowIndex === 0,
                                            isLast: rowIndex === itemsCount - 1,
                                        });
                                    }}
                                </UiPagedVirtualList>
                            </div>
                        );
                    }}
                </AutoSize>
            ) : null}
            {renderFooter()}
        </Fragment>
    );
}
