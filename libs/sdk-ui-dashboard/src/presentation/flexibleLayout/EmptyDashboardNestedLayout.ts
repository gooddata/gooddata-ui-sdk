// (C) 2022-2025 GoodData Corporation
import { EmptyNestedLayoutDropZone } from "./dragAndDrop/draggableWidget/EmptyNestedLayoutDropZone.js";
import { ViewModeEmptyNestedLayout } from "./ViewModeEmptyNestedLayout.js";
import { renderModeAware } from "../componentDefinition/index.js";

export const EmptyDashboardNestedLayout = renderModeAware({
    view: ViewModeEmptyNestedLayout,
    edit: EmptyNestedLayoutDropZone,
});
