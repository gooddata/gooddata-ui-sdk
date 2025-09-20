// (C) 2007-2025 GoodData Corporation

import { ElementType, ReactElement, useCallback, useMemo } from "react";

import cx from "classnames";
import { noop, pick } from "lodash-es";

import { guidFor } from "./guid.js";
import { LegacyList } from "./LegacyList.js";
import { LegacyListItem } from "./LegacyListItem.js";
import { LegacySingleSelectListItem } from "./LegacySingleSelectListItem.js";

/**
 * @internal
 */
export interface ILegacySingleSelectListProps<T> {
    className?: string;
    getItemKey?: (item: T) => string;
    height: number;
    itemHeight: number;
    items?: T[];
    itemsCount?: number;
    listItemClass?: ElementType;
    onItemMouseOut?: () => void;
    onItemMouseOver?: () => void;
    onItemMouseEnter?: (id: string) => void;
    onItemMouseLeave?: () => void;
    onRangeChange?: () => void;
    onScrollStart?: () => void;
    onSelect?: (item: T) => void;
    scrollToSelected?: boolean;
    rowItem?: ReactElement;
    selection?: T;
    width: number;
}

/**
 * @internal
 * @deprecated This component is deprecated use SingleSelectList instead
 */
export function LegacySingleSelectList<T>(props: ILegacySingleSelectListProps<T>): ReactElement {
    const {
        className = "",
        getItemKey = guidFor,
        items = [] as T[],
        itemsCount = 0,
        listItemClass = LegacySingleSelectListItem,
        onItemMouseOut = noop,
        onItemMouseOver = noop,
        onItemMouseEnter = noop,
        onItemMouseLeave = noop,
        onRangeChange = noop,
        onScrollStart = noop,
        onSelect = noop,
        rowItem = null as ReactElement,
        scrollToSelected = false,
        selection = {},
    } = props;

    const getSelectableItems = useCallback(() => {
        return items.map((source: T) => ({
            source,
            onSelect,
            onMouseOver: onItemMouseOver,
            onMouseOut: onItemMouseOut,
            onMouseEnter: onItemMouseEnter,
            onMouseLeave: onItemMouseLeave,
            selected: source === selection,
            id: getItemKey(source),
        }));
    }, [
        items,
        onSelect,
        onItemMouseOver,
        onItemMouseOut,
        onItemMouseEnter,
        onItemMouseLeave,
        selection,
        getItemKey,
    ]);

    const classNames = useMemo(() => {
        return cx("gd-list", className);
    }, [className]);

    const rowItemElement = useMemo(() => {
        return rowItem || <LegacyListItem listItemClass={listItemClass} />;
    }, [rowItem, listItemClass]);

    const dataSource = useMemo(() => {
        const selectableItems = getSelectableItems();

        return {
            rowsCount: itemsCount || selectableItems.length,
            getObjectAt: (rowIndex: number) => selectableItems[rowIndex],
        };
    }, [itemsCount, getSelectableItems]);

    return (
        <LegacyList
            className={classNames}
            {...pick(props, ["width", "height", "itemHeight"])}
            dataSource={dataSource}
            rowItem={rowItemElement}
            onScroll={onRangeChange}
            onScrollStart={onScrollStart}
            scrollToSelected={scrollToSelected}
        />
    );
}
