// (C) 2025-2026 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

import { DefaultTopBar } from "./DefaultTopBar.js";

/**
 * @internal
 */
export const RenderModeAwareTopBar = renderModeAware({
    view: DefaultTopBar,
    export: () => <></>,
});
