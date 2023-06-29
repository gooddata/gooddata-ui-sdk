// (C) 2022 GoodData Corporation

import { DefaultTitle } from "./DefaultTitle.js";
import { EditableTitle } from "./EditableTitle.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const RenderModeAwareTitle = renderModeAware({
    view: DefaultTitle,
    edit: EditableTitle,
});
