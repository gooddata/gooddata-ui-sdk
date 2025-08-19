// (C) 2025 GoodData Corporation

import { IContextStore, createContextStore } from "@gooddata/sdk-ui";

import { getItemInteractiveParent } from "./itemUtils.js";
import { IUiMenuContext, IUiMenuItemData } from "./types.js";

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
