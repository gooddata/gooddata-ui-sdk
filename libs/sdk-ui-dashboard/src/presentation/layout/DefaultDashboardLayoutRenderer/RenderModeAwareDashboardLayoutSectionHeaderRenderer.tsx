// (C) 2022 GoodData Corporation

import { renderModeAware } from "../../componentDefinition";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer";
import { DashboardLayoutEditSectionHeaderRenderer } from "./DashboardLayoutEditSectionHeaderRenderer";
import { IDashboardLayoutSectionHeaderRenderer } from "./interfaces";

/**
 * @internal
 */
export const RenderModeAwareDashboardLayoutSectionHeaderRenderer = renderModeAware({
    view: DashboardLayoutSectionHeaderRenderer,
    edit: DashboardLayoutEditSectionHeaderRenderer,
}) as IDashboardLayoutSectionHeaderRenderer<unknown>;
