// (C) 2022-2025 GoodData Corporation

import React from "react";
import { DefaultTitle } from "./DefaultTitle.js";
import { EditableTitle } from "./EditableTitle.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const RenderModeAwareTitle = renderModeAware({
    view: DefaultTitle,
    edit: EditableTitle,
    export: () => <></>,
});
