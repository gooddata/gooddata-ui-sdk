// (C) 2022-2025 GoodData Corporation
import {
    DefaultDashboardToolbar,
    DefaultDashboardToolbarButton,
    DefaultDashboardToolbarGroup,
    selectIsInEditMode,
    useDashboardSelector,
} from "@gooddata/sdk-ui-dashboard";

interface IPluginToolbarProps {
    reloadPlugins: () => void;
    togglePlugin: () => void;
    hideOverlays: () => void;
    isPluginEnabled: boolean;
    isHideOverlaysEnabled: boolean;
}

export function PluginToolbar({
    isPluginEnabled,
    isHideOverlaysEnabled,
    reloadPlugins,
    togglePlugin,
    hideOverlays,
}: IPluginToolbarProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    return (
        <DefaultDashboardToolbar>
            <DefaultDashboardToolbarGroup title="Plugins">
                <DefaultDashboardToolbarButton icon="sync" onClick={reloadPlugins} tooltip="Reload" />
                {!!isInEditMode && (
                    <DefaultDashboardToolbarButton
                        icon="invisible"
                        onClick={hideOverlays}
                        tooltip="Hide overlays"
                        disabled={!isHideOverlaysEnabled}
                    />
                )}
                <DefaultDashboardToolbarButton
                    icon="circle-cross"
                    onClick={togglePlugin}
                    tooltip={isPluginEnabled ? "Disable temporarily" : "Enable"}
                    isActive={!isPluginEnabled}
                />
            </DefaultDashboardToolbarGroup>
        </DefaultDashboardToolbar>
    );
}
