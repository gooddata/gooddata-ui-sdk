// (C) 2022 GoodData Corporation
import { renderModeAware } from "../componentDefinition";
import { EmptyDashboardDropZone } from "../dragAndDrop";
import { EmptyDashboardError } from "./EmptyDashboardError";

export const EmptyDashboardLayout = renderModeAware({
    view: EmptyDashboardError,
    edit: EmptyDashboardDropZone,
});
