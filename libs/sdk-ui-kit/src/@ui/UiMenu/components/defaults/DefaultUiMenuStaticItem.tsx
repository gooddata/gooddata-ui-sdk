// (C) 2025 GoodData Corporation

import { ReactElement, ReactNode, memo } from "react";

import { typedUiMenuContextStore } from "../../context.js";
import { IUiMenuItemData, IUiMenuStaticItemProps } from "../../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItem = memo(function DefaultUiMenuStaticItem<
    T extends IUiMenuItemData = object,
>({ item }: IUiMenuStaticItemProps<T>): ReactElement {
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
            {item.data as ReactNode}
        </li>
    );
});
