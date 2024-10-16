// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../componentDefinition/index.js";
import { EmptyDashboardDropZone } from "../dragAndDrop/index.js";
import { EmptyDashboardError } from "./EmptyDashboardError.js";

export const EmptyDashboardLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyDashboardDropZone,
});
