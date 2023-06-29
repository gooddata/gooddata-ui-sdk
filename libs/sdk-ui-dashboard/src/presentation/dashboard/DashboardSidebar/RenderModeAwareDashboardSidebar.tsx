// (C) 2022 GoodData Corporation
import React, { ComponentType } from "react";
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
