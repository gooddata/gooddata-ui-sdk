// (C) 2022-2025 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/index.js";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer.js";
import { DashboardLayoutEditSectionHeaderRenderer } from "./DashboardLayoutEditSectionHeaderRenderer.js";
import { IDashboardLayoutSectionHeaderRenderer } from "./interfaces.js";
import { DashboardLayoutExportSectionHeaderRenderer } from "./DashboardLayoutExportSectionHeaderRenderer.js";

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
