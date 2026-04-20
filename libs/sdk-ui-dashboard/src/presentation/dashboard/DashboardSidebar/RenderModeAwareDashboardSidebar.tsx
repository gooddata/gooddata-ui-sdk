// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";
import { SidebarConfigurationPanel } from "./SidebarConfigurationPanel.js";
import { type ISidebarProps } from "./types.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardSidebar = renderModeAware<ComponentType<ISidebarProps>>({
    view: () => <></>,
    edit: SidebarConfigurationPanel,
});
