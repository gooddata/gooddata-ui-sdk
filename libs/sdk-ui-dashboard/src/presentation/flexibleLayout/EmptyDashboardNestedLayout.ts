// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../componentDefinition/index.js";
import { ViewModeEmptyNestedLayout } from "./ViewModeEmptyNestedLayout.js";
import { EmptyNestedLayoutDropZone } from "./dragAndDrop/draggableWidget/EmptyNestedLayoutDropZone.js";

export const EmptyDashboardNestedLayout = renderModeAware({
    view: ViewModeEmptyNestedLayout,
    edit: EmptyNestedLayoutDropZone,
});
