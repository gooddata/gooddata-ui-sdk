// (C) 2025 GoodData Corporation

import React from "react";
import { IUiMenuItemData, IUiMenuStaticItemProps } from "../../types.js";
import { typedUiMenuContextStore } from "../../context.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItem = React.memo(function DefaultUiMenuStaticItem<
    T extends IUiMenuItemData = object,
>({ item }: IUiMenuStaticItemProps<T>): React.ReactElement {
    const { itemClassName } = typedUiMenuContextStore<T>().useContextStore((ctx) => ({
        itemClassName: ctx.itemClassName,
    }));

    return (
        <li role="none" className={typeof itemClassName === "function" ? itemClassName(item) : itemClassName}>
            {item.data as React.ReactNode}
        </li>
    );
});
