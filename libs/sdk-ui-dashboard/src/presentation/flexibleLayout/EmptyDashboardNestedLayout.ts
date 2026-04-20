// (C) 2022-2026 GoodData Corporation

import { renderModeAware } from "../componentDefinition/renderModeAware.js";
import { EmptyNestedLayoutDropZone } from "./dragAndDrop/draggableWidget/EmptyNestedLayoutDropZone.js";
import { ViewModeEmptyNestedLayout } from "./ViewModeEmptyNestedLayout.js";

export const EmptyDashboardNestedLayout = renderModeAware({
    view: ViewModeEmptyNestedLayout,
    edit: EmptyNestedLayoutDropZone,
});
