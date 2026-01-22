// (C) 2022-2026 GoodData Corporation

import { EmptyDashboardDropZone } from "./dragAndDrop/draggableWidget/EmptyDashboardDropZone.js";
import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { ExportEmptyDashboardError } from "./ExportEmptyDashboardError.js";
import { renderModeAware } from "../componentDefinition/renderModeAware.js";

export const EmptyDashboardLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyDashboardDropZone,
    export: ExportEmptyDashboardError,
});
