// (C) 2025 GoodData Corporation

import React from "react";

import { typedUiMenuContextStore } from "../../context.js";
import { IUiMenuItemData, IUiMenuStaticItemProps } from "../../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItem = React.memo(function DefaultUiMenuStaticItem<
    T extends IUiMenuItemData = object,
>({ item }: IUiMenuStaticItemProps<T>): React.ReactElement {
    const { itemClassName, itemDataTestId } = typedUiMenuContextStore<T>().useContextStore((ctx) => ({
        itemClassName: ctx.itemClassName,
        itemDataTestId: ctx.itemDataTestId,
    }));

    return (
        <li
            role="none"
            className={typeof itemClassName === "function" ? itemClassName(item) : itemClassName}
            data-testid={typeof itemDataTestId === "function" ? itemDataTestId(item) : itemDataTestId}
        >
            {item.data as React.ReactNode}
        </li>
    );
});
