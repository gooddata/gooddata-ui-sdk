// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode, memo } from "react";

import { typedUiMenuContextStore } from "../../context.js";
import { type IUiMenuStaticItemProps } from "../../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export const DefaultUiMenuStaticItem = memo<IUiMenuStaticItemProps>(function DefaultUiMenuStaticItem({
    item,
}): ReactElement {
    const { itemClassName, itemDataTestId } = typedUiMenuContextStore().useContextStoreValues([
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
