// (C) 2022 GoodData Corporation
import {
    DefaultDashboardToolbar,
    DefaultDashboardToolbarButton,
    DefaultDashboardToolbarGroup,
} from "@gooddata/sdk-ui-dashboard";
import React from "react";

interface IPluginToolbarProps {
    reloadPlugins: () => void;
    togglePlugin: () => void;
    hideOverlays: () => void;
    isPluginEnabled: boolean;
    isHideOverlaysEnabled: boolean;
}

export const PluginToolbar: React.FC<IPluginToolbarProps> = (props) => {
    const { isPluginEnabled, isHideOverlaysEnabled, reloadPlugins, togglePlugin, hideOverlays } = props;
    return (
        <DefaultDashboardToolbar>
            <DefaultDashboardToolbarGroup title="Plugins">
                <DefaultDashboardToolbarButton
                    icon="sync"
                    onClick={reloadPlugins}
                    tooltip="This will reload the plugin keeping any changes you made to the dashboard intact"
                />
                <DefaultDashboardToolbarButton
                    icon="invisible"
                    onClick={hideOverlays}
                    tooltip="This will hide all overlays over widgets and sections, that was added or modified by plugin"
                    disabled={!isHideOverlaysEnabled}
                />
                <DefaultDashboardToolbarButton
                    icon="circle-cross"
                    onClick={togglePlugin}
                    tooltip="This will reload the dashboard with or without the plugin applied keeping any changes you made to the dashboard intact"
                    isActive={!isPluginEnabled}
                />
            </DefaultDashboardToolbarGroup>
        </DefaultDashboardToolbar>
    );
};
