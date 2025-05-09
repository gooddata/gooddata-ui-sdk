// (C) 2025 GoodData Corporation

import { IUiMenuContext } from "./types.js";
import React from "react";
import { createContextStore, IContextStore } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const UiMenuContextStore = createContextStore<IUiMenuContext<unknown, unknown>>("UiMenu");
/**
 * @internal
 */
export const typedUiMenuContextStore = <InteractiveItemData, StaticItemData = React.ReactNode>() =>
    UiMenuContextStore as IContextStore<IUiMenuContext<InteractiveItemData, StaticItemData>>;
