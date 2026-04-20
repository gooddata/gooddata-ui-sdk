// (C) 2022-2026 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";
import { DefaultFilterBar } from "./DefaultFilterBar.js";

/**
 * @internal
 */
export const RenderModeAwareFilterBar = renderModeAware({
    view: DefaultFilterBar,
    export: () => <></>,
});
