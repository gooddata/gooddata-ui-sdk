// (C) 2022-2026 GoodData Corporation

import { type IAttributeFilterHandlerStoreContext } from "./redux/index.js";

/**
 * Configuration for attribute filter handler initialization.
 *
 * @internal
 */
export type AttributeFilterHandlerConfig = Omit<IAttributeFilterHandlerStoreContext, "eventListener">;
