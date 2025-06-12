// (C) 2022-2025 GoodData Corporation
import { renderModeAware } from "../componentDefinition/index.js";
import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { EmptyDashboardDropZone } from "./dragAndDrop/draggableWidget/EmptyDashboardDropZone.js";
import { ExportEmptyDashboardError } from "./ExportEmptyDashboardError.js";

export const EmptyDashboardLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyDashboardDropZone,
    export: ExportEmptyDashboardError,
});
