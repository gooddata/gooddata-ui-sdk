// (C) 2022-2025 GoodData Corporation

import { DashboardLayoutEditSectionHeaderRenderer } from "./DashboardLayoutEditSectionHeaderRenderer.js";
import { DashboardLayoutExportSectionHeaderRenderer } from "./DashboardLayoutExportSectionHeaderRenderer.js";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer.js";
import { IDashboardLayoutSectionHeaderRenderer } from "./interfaces.js";
import { renderModeAware } from "../../componentDefinition/index.js";

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
