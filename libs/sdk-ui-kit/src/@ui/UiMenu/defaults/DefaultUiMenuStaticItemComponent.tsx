// (C) 2025 GoodData Corporation

import React from "react";
import { UiMenuStaticItemProps } from "../types.js";
import { typedUiMenuContextStore } from "../context.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItemComponent = React.memo(function DefaultUiMenuStaticItemComponent<T>({
    item,
}: UiMenuStaticItemProps<T>): React.ReactElement {
    const { itemClassName } = typedUiMenuContextStore<unknown, unknown>().useContextStore((ctx) => ({
        itemClassName: ctx.itemClassName,
    }));

    return (
        <li role="none" className={typeof itemClassName === "function" ? itemClassName(item) : itemClassName}>
            {item.data as React.ReactNode}
        </li>
    );
});
