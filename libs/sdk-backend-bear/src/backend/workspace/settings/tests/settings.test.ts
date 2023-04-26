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
});
