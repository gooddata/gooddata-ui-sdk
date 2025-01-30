// (C) 2022-2025 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/index.js";
import { ExportableDashboardLayoutSectionRenderer } from "./ExportableDashboardLayoutSectionRenderer.js";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer.js";
import { EditableDashboardLayoutSectionRenderer } from "./EditableDashboardLayoutSectionRenderer.js";
import { IDashboardLayoutSectionRenderer } from "./interfaces.js";

/**
 * render function for DashboardLayoutSection respecting render mode
 *
 * @internal
 */
export const renderModeAwareDashboardLayoutSectionRenderer = renderModeAware({
    view: DashboardLayoutSectionRenderer,
    edit: EditableDashboardLayoutSectionRenderer,
    export: ExportableDashboardLayoutSectionRenderer,
}) as IDashboardLayoutSectionRenderer<unknown>;
