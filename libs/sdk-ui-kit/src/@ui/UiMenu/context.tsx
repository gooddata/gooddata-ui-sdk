// (C) 2025 GoodData Corporation

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
