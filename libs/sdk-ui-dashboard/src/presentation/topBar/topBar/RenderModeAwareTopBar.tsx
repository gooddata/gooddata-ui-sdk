// (C) 2025 GoodData Corporation

import { DefaultTopBar } from "./DefaultTopBar.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const RenderModeAwareTopBar = renderModeAware({
    view: DefaultTopBar,
    export: () => <></>,
});
