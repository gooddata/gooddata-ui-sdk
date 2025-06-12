// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import pick from "lodash/pick.js";
import cx from "classnames";
import noop from "lodash/noop.js";

import { LegacyList } from "./LegacyList.js";
import { LegacyListItem } from "./LegacyListItem.js";
import { LegacySingleSelectListItem } from "./LegacySingleSelectListItem.js";
import { guidFor } from "./guid.js";

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
    listItemClass?: React.ElementType;
    onItemMouseOut?: () => void;
    onItemMouseOver?: () => void;
    onItemMouseEnter?: (id: string) => void;
    onItemMouseLeave?: () => void;
    onRangeChange?: () => void;
    onScrollStart?: () => void;
    onSelect?: (item: T) => void;
    scrollToSelected?: boolean;
    rowItem?: React.ReactElement;
    selection?: T;
    width: number;
}

/**
 * @internal
 * @deprecated This component is deprecated use SingleSelectList instead
 */
export class LegacySingleSelectList<T> extends Component<ILegacySingleSelectListProps<T>> {
    static defaultProps = {
        className: "",
        getItemKey: guidFor,
        items: [] as any[],
        itemsCount: 0,
        listItemClass: LegacySingleSelectListItem,
        onItemMouseOut: noop,
        onItemMouseOver: noop,
        onItemMouseEnter: noop,
        onItemMouseLeave: noop,
        onRangeChange: noop,
        onScrollStart: noop,
        onSelect: noop,
        rowItem: null as React.ReactElement,
        scrollToSelected: false,
        selection: {},
    };

    private getSelectableItems() {
        const { props } = this;

        return props.items.map((source: T) => ({
            source,
            onSelect: props.onSelect,
            onMouseOver: props.onItemMouseOver,
            onMouseOut: props.onItemMouseOut,
            onMouseEnter: props.onItemMouseEnter,
            onMouseLeave: props.onItemMouseLeave,
            selected: source === props.selection,
            id: props.getItemKey(source),
        }));
    }

    private getClassNames(): string {
        return cx("gd-list", this.props.className);
    }

    private getRowItem() {
        const { rowItem, listItemClass } = this.props;

        return rowItem || <LegacyListItem listItemClass={listItemClass} />;
    }

    private getDataSource() {
        const selectableItems = this.getSelectableItems();

        return {
            rowsCount: this.props.itemsCount || selectableItems.length,
            getObjectAt: (rowIndex: number) => selectableItems[rowIndex],
        };
    }

    public render(): JSX.Element {
        const rowItem = this.getRowItem();
        const dataSource = this.getDataSource();

        return (
            <LegacyList
                className={this.getClassNames()}
                {...pick(this.props, ["width", "height", "itemHeight"])}
                dataSource={dataSource}
                rowItem={rowItem}
                onScroll={this.props.onRangeChange}
                onScrollStart={this.props.onScrollStart}
                scrollToSelected={this.props.scrollToSelected}
            />
        );
    }
}
