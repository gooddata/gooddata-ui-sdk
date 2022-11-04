// (C) 2022 GoodData Corporation

import { renderModeAware } from "../../componentDefinition";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer";
import { EditableDashboardLayoutSectionRenderer } from "./EditableDashboardLayoutSectionRenderer";
import { IDashboardLayoutSectionRenderer } from "./interfaces";

/**
 * render function for DashboardLayoutSection respecting render mode
 *
 * @internal
 */
export const renderModeAwareDashboardLayoutSectionRenderer = renderModeAware({
    view: DashboardLayoutSectionRenderer,
    edit: EditableDashboardLayoutSectionRenderer,
}) as IDashboardLayoutSectionRenderer<unknown>;
