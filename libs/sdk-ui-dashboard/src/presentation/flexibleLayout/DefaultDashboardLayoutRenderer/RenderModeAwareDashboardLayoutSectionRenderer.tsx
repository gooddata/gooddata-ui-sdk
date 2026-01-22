// (C) 2022-2026 GoodData Corporation

import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer.js";
import { EditableDashboardLayoutSectionRenderer } from "./EditableDashboardLayoutSectionRenderer.js";
import { ExportableDashboardLayoutSectionRenderer } from "./ExportableDashboardLayoutSectionRenderer.js";
import { type IDashboardLayoutSectionRenderer } from "./interfaces.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * render function for DashboardLayoutSection respecting render mode
 *
 * @internal
 */
export const renderModeAwareDashboardLayoutSectionRenderer = renderModeAware({
    view: DashboardLayoutSectionRenderer,
    edit: EditableDashboardLayoutSectionRenderer as IDashboardLayoutSectionRenderer<unknown>,
    export: ExportableDashboardLayoutSectionRenderer,
}) as IDashboardLayoutSectionRenderer<unknown>;
