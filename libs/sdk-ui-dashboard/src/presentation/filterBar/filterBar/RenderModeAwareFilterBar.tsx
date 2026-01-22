// (C) 2022-2026 GoodData Corporation

import { DefaultFilterBar } from "./DefaultFilterBar.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareFilterBar = renderModeAware({
    view: DefaultFilterBar,
    export: () => <></>,
});
