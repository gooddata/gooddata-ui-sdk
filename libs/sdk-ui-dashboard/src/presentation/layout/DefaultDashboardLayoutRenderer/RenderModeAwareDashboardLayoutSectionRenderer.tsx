// (C) 2022 GoodData Corporation

import { renderModeAware } from "../../componentDefinition";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer";
import { EditableDashboardLayoutSectionRenderer } from "./EditableDashboardLayoutSectionRenderer";
import { IDashboardLayoutSectionRenderer } from "./interfaces";

/**
 * @internal
 */
export const RenderModeAwareDashboardLayoutSectionRenderer = renderModeAware({
    view: DashboardLayoutSectionRenderer,
    edit: EditableDashboardLayoutSectionRenderer,
}) as IDashboardLayoutSectionRenderer<unknown>;
