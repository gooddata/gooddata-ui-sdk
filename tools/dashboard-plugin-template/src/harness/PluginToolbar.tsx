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
                <DefaultDashboardToolbarButton icon="sync" onClick={reloadPlugins} tooltip="Reload" />
                <DefaultDashboardToolbarButton
                    icon="invisible"
                    onClick={hideOverlays}
                    tooltip="Hide overlays"
                    disabled={!isHideOverlaysEnabled}
                />
                <DefaultDashboardToolbarButton
                    icon="circle-cross"
                    onClick={togglePlugin}
                    tooltip={isPluginEnabled ? "Disable temporarily" : "Enable"}
                    isActive={!isPluginEnabled}
                />
            </DefaultDashboardToolbarGroup>
        </DefaultDashboardToolbar>
    );
};
