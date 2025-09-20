// (C) 2007-2025 GoodData Corporation
import { identity } from "lodash-es";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "../../dummyBackend/index.js";
import { withCustomWorkspaceSettings } from "../index.js";

describe("withCustomWorkspaceSettings backend", () => {
    it("does no change if wrappers are not provided", async () => {
        const dummySettings = await dummyBackend().workspace("test_workspace_id").settings().getSettings();
        const dummyUserSettings = await dummyBackend()
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();
        const backend = withCustomWorkspaceSettings(dummyBackend(), {});

        const settings = await backend.workspace("test_workspace_id").settings().getSettings();
        const userSettings = await backend
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toEqual(dummySettings);
        expect(userSettings).toEqual(dummyUserSettings);
    });

    it("does no change if the wrappers are identity", async () => {
        const dummySettings = await dummyBackend().workspace("test_workspace_id").settings().getSettings();
        const dummyUserSettings = await dummyBackend()
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();
        const backend = withCustomWorkspaceSettings(dummyBackend(), {
            currentUserSettingsWrapper: identity,
            settingsWrapper: identity,
        });

        const settings = await backend.workspace("test_workspace_id").settings().getSettings();
        const userSettings = await backend
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toEqual(dummySettings);
        expect(userSettings).toEqual(dummyUserSettings);
    });

    it("reflects changes done in the wrappers", async () => {
        const backend = withCustomWorkspaceSettings(dummyBackend(), {
            settingsWrapper: (settings) => ({
                ...settings,
                testSetting: "altered_value",
                testSetting2: "new_value",
            }),
            currentUserSettingsWrapper: (settings) => ({
                ...settings,
                testSetting: "altered_value",
                testSetting2: "new_value",
            }),
        });

        const settings = await backend.workspace("test_workspace_id").settings().getSettings();
        const userSettings = await backend
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toEqual({
            testSetting: "altered_value",
            testSetting2: "new_value",
            workspace: "test_workspace_id",
        });
        expect(userSettings).toEqual({
            locale: "test_locale",
            separators: {
                decimal: ".",
                thousand: ",",
            },
            testSetting: "altered_value",
            testSetting2: "new_value",
            userId: "test_user_id",
            workspace: "test_workspace_id",
        });
    });

    it("allows to set both workspace and user settings by single wrapper", async () => {
        const backend = withCustomWorkspaceSettings(dummyBackend(), {
            commonSettingsWrapper: (settings) => ({
                ...settings,
                testSetting: "value_from_common",
                newSetting: "new_value_common",
            }),
        });

        const settings = await backend.workspace("test_workspace_id").settings().getSettings();
        const userSettings = await backend
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toEqual({
            testSetting: "value_from_common",
            newSetting: "new_value_common",
            workspace: "test_workspace_id",
        });
        expect(userSettings).toEqual({
            locale: "test_locale",
            separators: {
                decimal: ".",
                thousand: ",",
            },
            testSetting: "value_from_common",
            newSetting: "new_value_common",
            userId: "test_user_id",
            workspace: "test_workspace_id",
        });
    });

    it("can combine workspace, user and common settings wrappers", async () => {
        const backend = withCustomWorkspaceSettings(dummyBackend(), {
            settingsWrapper: (settings) => ({
                ...settings,
                testSetting: "altered_value",
                newSetting: "new_value_workspace",
            }),
            currentUserSettingsWrapper: (settings) => ({
                ...settings,
                testSetting: "altered_value",
                newSetting: "new_value_user",
            }),
            commonSettingsWrapper: () => ({
                newSetting: "new_value_common",
            }),
        });

        const settings = await backend.workspace("test_workspace_id").settings().getSettings();
        const userSettings = await backend
            .workspace("test_workspace_id")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toEqual({
            testSetting: "altered_value",
            newSetting: "new_value_workspace",
            workspace: "test_workspace_id",
        });
        expect(userSettings).toEqual({
            locale: "test_locale",
            separators: {
                decimal: ".",
                thousand: ",",
            },
            testSetting: "altered_value",
            newSetting: "new_value_user",
            userId: "test_user_id",
            workspace: "test_workspace_id",
        });
    });
});
