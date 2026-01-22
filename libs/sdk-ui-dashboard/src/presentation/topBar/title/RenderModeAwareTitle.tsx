// (C) 2022-2026 GoodData Corporation

import { DefaultTitle } from "./DefaultTitle.js";
import { EditableTitle } from "./EditableTitle.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareTitle = renderModeAware({
    view: DefaultTitle,
    edit: EditableTitle,
    export: () => <></>,
});
