// (C) 2022-2026 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

import { DefaultTitle } from "./DefaultTitle.js";
import { EditableTitle } from "./EditableTitle.js";

/**
 * @internal
 */
export const RenderModeAwareTitle = renderModeAware({
    view: DefaultTitle,
    edit: EditableTitle,
    export: () => <></>,
});
