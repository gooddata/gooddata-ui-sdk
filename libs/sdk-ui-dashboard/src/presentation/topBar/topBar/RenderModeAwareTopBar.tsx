// (C) 2025-2026 GoodData Corporation

import { DefaultTopBar } from "./DefaultTopBar.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareTopBar = renderModeAware({
    view: DefaultTopBar,
    export: () => <></>,
});
