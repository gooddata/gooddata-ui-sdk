// (C) 2025 GoodData Corporation

import { type ReactElement, type ReactNode, memo } from "react";

import { typedUiMenuContextStore } from "../../context.js";
import { type IUiMenuItemData, type IUiMenuStaticItemProps } from "../../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItem = memo(function DefaultUiMenuStaticItem<
    T extends IUiMenuItemData = object,
>({ item }: IUiMenuStaticItemProps<T>): ReactElement {
    const { itemClassName, itemDataTestId } = typedUiMenuContextStore<T>().useContextStoreValues([
        "itemClassName",
        "itemDataTestId",
    ]);

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
