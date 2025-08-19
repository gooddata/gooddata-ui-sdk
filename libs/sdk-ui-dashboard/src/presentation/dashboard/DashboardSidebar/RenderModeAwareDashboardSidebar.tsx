// (C) 2022-2025 GoodData Corporation
import React, { ComponentType } from "react";

import { SidebarConfigurationPanel } from "./SidebarConfigurationPanel.js";
import { ISidebarProps } from "./types.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardSidebar = renderModeAware<ComponentType<ISidebarProps>>({
    view: () => <></>,
    edit: SidebarConfigurationPanel,
});
