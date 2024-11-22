// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../componentDefinition/index.js";
import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { EmptyDashboardDropZone } from "./dragAndDrop/draggableWidget/EmptyDashboardDropZone.js";

export const EmptyDashboardLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyDashboardDropZone,
});
