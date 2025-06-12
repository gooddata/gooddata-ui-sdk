// (C) 2022-2025 GoodData Corporation

import React from "react";
import { DefaultFilterBar } from "./DefaultFilterBar.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const RenderModeAwareFilterBar = renderModeAware({
    view: DefaultFilterBar,
    export: () => <></>,
});
