// (C) 2022-2026 GoodData Corporation

import { DashboardLayoutEditSectionHeaderRenderer } from "./DashboardLayoutEditSectionHeaderRenderer.js";
import { DashboardLayoutExportSectionHeaderRenderer } from "./DashboardLayoutExportSectionHeaderRenderer.js";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer.js";
import { type IDashboardLayoutSectionHeaderRenderer } from "./interfaces.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * render function for DashboardLayoutSectionHeader respecting render mode
 *
 * @internal
 */
export const renderModeAwareDashboardLayoutSectionHeaderRenderer = renderModeAware({
    view: DashboardLayoutSectionHeaderRenderer,
    edit: DashboardLayoutEditSectionHeaderRenderer,
    export: DashboardLayoutExportSectionHeaderRenderer,
}) as IDashboardLayoutSectionHeaderRenderer<unknown>;
