// (C) 2022-2025 GoodData Corporation
import { ComponentType } from "react";
import { renderModeAware } from "../../componentDefinition/index.js";
import { SidebarConfigurationPanel } from "./SidebarConfigurationPanel.js";
import { ISidebarProps } from "./types.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardSidebar = renderModeAware<ComponentType<ISidebarProps>>({
    view: () => <></>,
    edit: SidebarConfigurationPanel,
});
