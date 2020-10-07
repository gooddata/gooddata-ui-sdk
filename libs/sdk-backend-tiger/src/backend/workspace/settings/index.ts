// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";

const HardcodedSettings = {
    // AD specific
    analyticalDesigner: true,
    enablePushpinGeoChart: true,
    enableBulletChart: true,
    enableComboChart: true,
    enableNewADFilterBar: true,
    enableMeasureValueFilters: true,
    enableMetricDateFilter: true,
    enableWeekFilters: true,
    enableCustomMeasureFormatting: true,
    ADMeasureValueFilterNullAsZeroOption: "EnabledCheckedByDefault",
    enableHidingOfDataPoints: true,

    // KD specific
    enableAnalyticalDashboards: true,
    hidePixelPerfectExperience: true,
};

export class TigerWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getSettings(): Promise<IWorkspaceSettings> {
        return this.authCall(async () => {
            return {
                workspace: this.workspace,
                ...HardcodedSettings,
            };
        });
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.authCall(async () => {
            return {
                userId: "dummy",
                locale: "en-US",
                workspace: this.workspace,
                ...HardcodedSettings,
            };
        });
    }
}
