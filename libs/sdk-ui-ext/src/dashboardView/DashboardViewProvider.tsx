// (C) 2020 GoodData Corporation
import React from "react";
import {
    ICatalogAttribute,
    ICatalogDateAttribute,
    IUserWorkspaceSettings,
    IWidgetAlert,
} from "@gooddata/sdk-backend-spi";
import { IColorPalette, IExecutionConfig } from "@gooddata/sdk-model";
import {
    AttributesWithDrillDownProvider,
    ColorPaletteProvider,
    DashboardAlertsProvider,
    DashboardViewConfigProvider,
    DashboardViewExecConfigProvider,
    DashboardViewIsReadOnlyProvider,
    UserWorkspaceSettingsProvider,
} from "./contexts";
import { IDashboardViewConfig } from "./types";
import { InternalIntlWrapper } from "../internal";

/**
 * @internal
 */
export interface IDashboardViewProviderProps {
    children: React.ReactNode;
    config: IDashboardViewConfig;
    settings: IUserWorkspaceSettings;
    colorPalette: IColorPalette;
    drillDownAttributes: Array<ICatalogAttribute | ICatalogDateAttribute>;
    alerts: IWidgetAlert[];
    isReadOnly: boolean;
    locale: string;
    execConfig: IExecutionConfig;
}

/**
 * @internal
 */
export const DashboardViewProvider: React.FC<IDashboardViewProviderProps> = ({
    children,
    locale,
    config,
    settings,
    colorPalette,
    drillDownAttributes,
    alerts,
    isReadOnly,
    execConfig,
}) => {
    return (
        <InternalIntlWrapper locale={locale} workspace={settings.workspace}>
            <DashboardViewConfigProvider config={config}>
                <DashboardViewExecConfigProvider execConfig={execConfig}>
                    <UserWorkspaceSettingsProvider settings={settings}>
                        <ColorPaletteProvider palette={colorPalette}>
                            <AttributesWithDrillDownProvider attributes={drillDownAttributes}>
                                <DashboardAlertsProvider alerts={alerts}>
                                    <DashboardViewIsReadOnlyProvider isReadOnly={isReadOnly}>
                                        {children}
                                    </DashboardViewIsReadOnlyProvider>
                                </DashboardAlertsProvider>
                            </AttributesWithDrillDownProvider>
                        </ColorPaletteProvider>
                    </UserWorkspaceSettingsProvider>
                </DashboardViewExecConfigProvider>
            </DashboardViewConfigProvider>
        </InternalIntlWrapper>
    );
};
