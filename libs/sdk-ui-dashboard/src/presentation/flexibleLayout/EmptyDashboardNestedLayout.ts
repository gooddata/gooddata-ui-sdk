// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../componentDefinition/index.js";

import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { EmptyNestedLayoutDropZone } from "./dragAndDrop/draggableWidget/EmptyNestedLayoutDropZone.js";

export const EmptyDashboardNestedLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyNestedLayoutDropZone,
});
