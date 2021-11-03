// (C) 2021 GoodData Corporation
import { mergeWorkspaceAndUserSettings } from "../settings";

describe("mergeWorkspaceAndUserSettings", () => {
    it("should prioritize user setting over project one", () => {
        const workspaceSettings = {
            workspaceSetting: "projectValue",
            setting: "projectValue",
        };
        const userSettings = {
            userSetting: "userValue",
            setting: "userValue",
        };
        expect(mergeWorkspaceAndUserSettings(workspaceSettings, userSettings)).toMatchSnapshot();
    });

    it("should omit ignored user setting and keep project one", () => {
        const workspaceSettings = {
            workspaceSetting: "projectValue",
            enableAnalyticalDashboardPermissions: "projectValue",
        };
        const userSettings = {
            userSetting: "userValue",
            enableAnalyticalDashboardPermissions: "userValue",
        };
        expect(mergeWorkspaceAndUserSettings(workspaceSettings, userSettings)).toMatchSnapshot();
    });
});
