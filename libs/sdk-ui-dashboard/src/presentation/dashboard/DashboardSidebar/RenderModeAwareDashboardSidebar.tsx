// (C) 2022 GoodData Corporation
import React, { ComponentType } from "react";
import { renderModeAware } from "../../componentDefinition";
import { SidebarConfigurationPanel } from "./SidebarConfigurationPanel";
import { ISidebarProps } from "./types";

/**
 * @internal
 */
export const RenderModeAwareDashboardSidebar = renderModeAware<ComponentType<ISidebarProps>>({
    view: () => <></>,
    edit: SidebarConfigurationPanel,
});
