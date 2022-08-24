// (C) 2021-2022 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface ISidebarProps {
    /**
     * Contains reference to default implementation of the sidebar. If you are implementing a custom
     * sidebar that decorates default side bar, then use this component to render the default sidebar.
     */
    DefaultSidebar: ComponentType<ISidebarProps>;

    /**
     * Specify className for configurationPanel.
     */
    configurationPanelClassName?: string;
}

/**
 * @alpha
 */
export type CustomSidebarComponent = ComponentType<ISidebarProps>;
