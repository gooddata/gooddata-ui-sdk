// (C) 2022 GoodData Corporation

import { renderModeAware } from "../../componentDefinition";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer";
import { DashboardLayoutEditSectionHeaderRenderer } from "./DashboardLayoutEditSectionHeaderRenderer";
import { IDashboardLayoutSectionHeaderRenderer } from "./interfaces";

/**
 * render function for DashboardLayoutSectionHeader respecting render mode
 *
 * @internal
 */
export const renderModeAwareDashboardLayoutSectionHeaderRenderer = renderModeAware({
    view: DashboardLayoutSectionHeaderRenderer,
    edit: DashboardLayoutEditSectionHeaderRenderer,
}) as IDashboardLayoutSectionHeaderRenderer<unknown>;
