// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { typedUiMenuContextStore } from "../../context.js";
import { getItemPositionInMenuLevel } from "../../itemUtils.js";

import { DefaultUiMenuContentItemWrapper } from "./DefaultUiMenuContentItem.js";
import { DefaultUiMenuInteractiveItemWrapper } from "./DefaultUiMenuInteractiveItem.js";

/**
 * Position of a menu item on its menu level (`aria-posinset` / `aria-setsize`), counted across all groups.
 *
 * The count is only reliable when the menu renders every item with its default wrappers. A custom item
 * wrapper may render some interactive or content items as something other than a menu item (for example
 * a row with a button), so the menu can't tell how many menu items there are. In that case no position
 * is reported and assistive technologies count the rendered menu items themselves.
 *
 * @internal
 */
export function useMenuItemPosition(itemId: string): { posInSet: number; setSize: number } | undefined {
    const { useContextStore, createSelector } = typedUiMenuContextStore();
    const selector = createSelector((ctx) => ({
        items: ctx.items,
        hasCustomItemWrapper:
            ctx.InteractiveItemWrapper !== DefaultUiMenuInteractiveItemWrapper ||
            ctx.ContentItemWrapper !== DefaultUiMenuContentItemWrapper,
    }));
    const { items, hasCustomItemWrapper } = useContextStore(selector);

    return useMemo(
        () => (hasCustomItemWrapper ? undefined : getItemPositionInMenuLevel(items, itemId)),
        [hasCustomItemWrapper, items, itemId],
    );
}
