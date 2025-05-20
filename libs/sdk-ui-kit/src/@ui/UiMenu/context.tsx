// (C) 2025 GoodData Corporation

import { getItemInteractiveParent } from "./itemUtils.js";
import { IUiMenuContext, IUiMenuItemData } from "./types.js";
import { createContextStore, IContextStore } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const UiMenuContextStore = createContextStore<IUiMenuContext>("UiMenu");
/**
 * @internal
 */
export const typedUiMenuContextStore = <T extends IUiMenuItemData = object, M = object>() =>
    UiMenuContextStore as unknown as IContextStore<IUiMenuContext<T, M>>;
/**
 * @internal
 */
export const getSelectedMenuId = <T extends IUiMenuItemData = object, M = object>(
    context: IUiMenuContext<T, M>,
): string | undefined => {
    const { focusedItem, shownCustomContentItemId, items } = context;
    return shownCustomContentItemId
        ? shownCustomContentItemId
        : getItemInteractiveParent(items, focusedItem.id)?.id;
};
