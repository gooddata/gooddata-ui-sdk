// (C) 2022 GoodData Corporation

import { DefaultTitle } from "./DefaultTitle";
import { EditableTitle } from "./EditableTitle";
import { renderModeAware } from "../../componentDefinition";

/**
 * @internal
 */
export const RenderModeAwareTitle = renderModeAware({
    view: DefaultTitle,
    edit: EditableTitle,
});
