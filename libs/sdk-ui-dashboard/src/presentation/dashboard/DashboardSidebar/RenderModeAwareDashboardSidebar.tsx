// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { SidebarConfigurationPanel } from "./SidebarConfigurationPanel.js";
import { type ISidebarProps } from "./types.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardSidebar = renderModeAware<ComponentType<ISidebarProps>>({
    view: () => <></>,
    edit: SidebarConfigurationPanel,
});
