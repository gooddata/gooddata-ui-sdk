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
import { useIntl } from "react-intl";

import { SELECT_ITEM_ACTION } from "../@ui/hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore, useScopedIdStoreValue } from "../@ui/hooks/useScopedId.js";
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
import { useIdPrefixed } from "../utils/useId.js";

import { DropdownTabs } from "./DropdownTabs.js";

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
    isSelected?: boolean;
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
    listPadding?: number;

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
    /**
     * Text announced to screen readers when the search matches no items.
     * Provide the same text that the rendered "no matching data" state shows.
     * Defaults to a translated "No results match.".
     */
    noMatchingDataText?: string;
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
    /**
     * Predicate that returns true for the currently selected item. It drives the options'
     * `aria-selected` and the `isSelected` render prop.
     */
    getIsItemSelected?: (item: T) => boolean;
    /**
     * Returns a key that is unique for each item. When it is provided together with the `listbox` role,
     * the options get unique ids, so that the active option can be exposed by `aria-activedescendant`.
     *
     * @remarks
     * If the search is shown as well, the search input becomes a combobox that drives the listbox:
     * ArrowDown and ArrowUp move the active option and Enter confirms it. Escape clears a typed filter
     * first and closes the dropdown when the filter is empty, as in the other dropdowns.
     * The listbox is then taken out of the Tab order.
     */
    getItemKey?: (item: T) => string;

    accessibilityConfig?: Pick<IAccessibilityConfigBase, "ariaLabel" | "ariaLabelledBy" | "role">;

    body?: ReactNode | ((closeDropdown: () => void) => ReactNode);

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

function DefaultNoDataComponent({ hasNoMatchingData }: { hasNoMatchingData: boolean }) {
    const intl = useIntl();

    return (
        <NoData
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage({ id: "gs.noData.noMatchingData" })}
            noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
        />
    );
}

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
    listPadding,
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
    noMatchingDataText,
    footer,
    closeDropdown,
    accessibilityConfig,
    renderItem,
    body,
    itemHeightGetter,
    itemTitleGetter,
    getIsItemSelected,
    getItemKey,
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
    const searchWrapperStyle = isMobile || width === undefined ? { display: "contents" } : { width };

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

    const renderBody = () => {
        if (!body) {
            return null;
        }

        if (typeof body === "function") {
            return body(closeDropdown!);
        }

        return body;
    };

    const hasOptionIds = accessibilityConfig?.role === "listbox" && !!getItemKey;
    const isCombobox = !!showSearch && hasOptionIds;
    const isListShown = !isLoading && itemsCount > 0;
    const listboxId = useIdPrefixed("dropdown-listbox");
    const noDataId = useIdPrefixed("dropdown-no-data");
    // the combobox is described by the visible empty state while the search matches nothing
    const isNoMatchingDataDescribed = isCombobox && hasNoMatchingData;
    const scopedIdStoreValue = useScopedIdStoreValue<T>(getItemKey ?? String);

    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const activeIndex =
        isCombobox && isListShown && activeItemKey !== undefined
            ? items.findIndex(
                  (item) => item !== undefined && item !== null && getItemKey!(item) === activeItemKey,
              )
            : -1;
    // items may be falsy (e.g. 0), so the presence of the active item is checked by its index
    const hasActiveItem = activeIndex >= 0;
    const activeItem = hasActiveItem ? items[activeIndex] : undefined;

    const onChange = useCallback(
        (search: string | number) => {
            onSearch?.(search.toString());
            setCurrentSearchString(search.toString());
            setActiveItemKey(undefined);
        },
        [onSearch],
    );

    const moveActiveItem = (direction: "next" | "previous") => {
        const loadedCount = items.length;
        if (!isListShown || loadedCount === 0) {
            return;
        }

        let nextIndex: number;
        if (direction === "next") {
            const isLast = activeIndex >= loadedCount - 1;
            // when more items can be loaded, stay on the last one; showing it loads the next page
            nextIndex = isLast ? (hasNextPage ? activeIndex : 0) : activeIndex + 1;
        } else {
            nextIndex = activeIndex <= 0 ? loadedCount - 1 : activeIndex - 1;
        }

        const nextItem = items[nextIndex];
        if (nextItem !== undefined && nextItem !== null) {
            setActiveItemKey(getItemKey!(nextItem));
        }
    };

    const onSearchKeyDown = (e: KeyboardEvent) => {
        if (isCombobox && !e.nativeEvent.isComposing) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                moveActiveItem(e.key === "ArrowDown" ? "next" : "previous");
                return;
            }

            // only Enter in the input itself; Enter on the clear button must still clear the filter
            if (e.key === "Enter" && hasActiveItem && e.target instanceof HTMLInputElement) {
                e.preventDefault();
                e.stopPropagation();
                (onKeyDownConfirm ?? onKeyDownSelect)?.(activeItem as T);
                return;
            }
        }

        if (isTypingKey(e)) {
            e.stopPropagation();
        }
    };

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
                    <div style={searchWrapperStyle} onKeyDown={onSearchKeyDown}>
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
                            accessibilityConfig={
                                isCombobox
                                    ? {
                                          ariaLabel: searchLabel,
                                          role: "combobox",
                                          ariaExpanded: isListShown,
                                          ariaControls: isListShown ? listboxId : undefined,
                                          ariaAutocomplete: "list",
                                          ariaDescribedBy: isNoMatchingDataDescribed ? noDataId : undefined,
                                          ariaActiveDescendant: hasActiveItem
                                              ? scopedIdStoreValue.makeId({
                                                    item: activeItem as T,
                                                    specifier: SELECT_ITEM_ACTION,
                                                })
                                              : undefined,
                                      }
                                    : {
                                          ariaLabel: searchLabel,
                                      }
                            }
                        />
                    </div>
                    <UiSearchResultsAnnouncement
                        // do not announce the stale count while the filtered items are loading
                        totalResults={currentSearchString && !isLoading ? itemsCount : undefined}
                        noResultsText={noMatchingDataText}
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
            {renderBody()}
            {hasNoData ? (
                <div
                    id={isNoMatchingDataDescribed ? noDataId : undefined}
                    style={{ width: isMobile ? "auto" : width }}
                >
                    {renderNoData({ hasNoMatchingData })}
                </div>
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

                        const list = (
                            <UiPagedVirtualList<T>
                                maxHeight={effectiveMaxHeight}
                                items={items}
                                itemHeight={effectiveItemHeight}
                                itemsGap={0}
                                itemPadding={0}
                                containerPadding={containerPadding}
                                listPadding={listPadding}
                                onKeyDownSelect={onKeyDownSelect}
                                onKeyDownConfirm={onKeyDownConfirm}
                                closeDropdown={closeDropdown}
                                itemHeightGetter={itemHeightGetter}
                                getIsItemSelected={getIsItemSelected}
                                hasNextPage={hasNextPage}
                                loadNextPage={loadNextPage}
                                skeletonItemsCount={skeletonItemsCount}
                                SkeletonItem={SkeletonItem}
                                shouldLoadNextPage={shouldLoadNextPage}
                                isLoading={isNextPageLoading}
                                onScroll={onScroll}
                                scrollToItem={hasActiveItem ? activeItem : scrollToItem}
                                scrollToItemKeyExtractor={
                                    hasActiveItem ? getItemKey : scrollToItemKeyExtractor
                                }
                                // the combobox drives the listbox, so the listbox is out of the Tab order
                                tabIndex={isCombobox ? -1 : undefined}
                                focusedItem={activeItem}
                                representAs={
                                    accessibilityConfig?.role === "listbox"
                                        ? "listbox"
                                        : accessibilityConfig?.role === "list"
                                          ? "list"
                                          : undefined
                                }
                                listboxProps={
                                    accessibilityConfig?.role === "listbox" ||
                                    accessibilityConfig?.role === "list"
                                        ? {
                                              id: isCombobox ? listboxId : undefined,
                                              "aria-label": accessibilityConfig?.ariaLabel,
                                              "aria-labelledby": accessibilityConfig?.ariaLabelledBy,
                                          }
                                        : undefined
                                }
                            >
                                {(item) => {
                                    const rowIndex = items.indexOf(item);
                                    const rowHeight = itemHeightGetter?.(rowIndex) ?? effectiveItemHeight;
                                    return renderItem({
                                        rowIndex,
                                        item,
                                        width: listWidth,
                                        height: rowHeight,
                                        isFirst: rowIndex === 0,
                                        isLast: rowIndex === itemsCount - 1,
                                        focused: isCombobox ? rowIndex === activeIndex : undefined,
                                        isSelected: getIsItemSelected?.(item),
                                    });
                                }}
                            </UiPagedVirtualList>
                        );

                        return (
                            <div
                                data-testid="gd-dropdown-list"
                                id={id}
                                style={{ width: listWidth }}
                                className={listClassNames}
                                role={
                                    accessibilityConfig?.role === "listbox" ||
                                    accessibilityConfig?.role === "list"
                                        ? undefined
                                        : accessibilityConfig?.role
                                }
                                aria-label={
                                    accessibilityConfig?.role === "listbox" ||
                                    accessibilityConfig?.role === "list"
                                        ? undefined
                                        : accessibilityConfig?.ariaLabel
                                }
                                aria-labelledby={
                                    accessibilityConfig?.role === "listbox" ||
                                    accessibilityConfig?.role === "list"
                                        ? undefined
                                        : accessibilityConfig?.ariaLabelledBy
                                }
                            >
                                {hasOptionIds ? (
                                    <ScopedIdStore value={scopedIdStoreValue}>{list}</ScopedIdStore>
                                ) : (
                                    list
                                )}
                            </div>
                        );
                    }}
                </AutoSize>
            ) : null}
            {renderFooter()}
        </Fragment>
    );
}
