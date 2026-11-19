// (C) 2026 GoodData Corporation

// @vitest-environment node

import { runSaga } from "redux-saga";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IColorPalette, type ISeparators } from "@gooddata/sdk-model";

import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import { initializeDashboard } from "../../../commands/dashboard.js";
import { disabledUnfinishedFeatureSettings } from "../../../disabledUnfinishedFeatureSettings.js";
import { type DashboardConfig, type DashboardContext } from "../../../types/commonTypes.js";

import { resolveDashboardConfig } from "./resolveDashboardConfig.js";

const separators: ISeparators = { thousand: ",", decimal: "." };
const colorPalette: IColorPalette = [];

const backendSettings: IUserWorkspaceSettings = {
    userId: "user",
    workspace: "ws",
    locale: "en-US",
    separators,
    enableDashboardPersistentFiltersAcrossTabs: true,
    sharedKey: "backend",
    unfinishedFeature: true,
};

// with dateFilterConfig and colorPalette supplied, the settings call is the only backend call
const baseConfig: DashboardConfig = { dateFilterConfig: defaultDateFilterConfig, colorPalette };

async function resolve(config: DashboardConfig, settingsFromBackend = backendSettings) {
    const getSettingsForCurrentUser = vi.fn().mockResolvedValue(settingsFromBackend);
    const workspace = vi.fn(() => ({
        settings: () => ({ getSettingsForCurrentUser }),
        styling: () => ({ getColorPalette: () => Promise.resolve(colorPalette) }),
        dateFilterConfigs: () => ({
            withLimit: () => ({
                queryCustomDateFilterConfig: () => Promise.resolve({ items: [defaultDateFilterConfig] }),
            }),
        }),
    }));
    const ctx = { workspace: "ws", backend: { workspace } } as unknown as DashboardContext;

    const resolved = await runSaga(
        { dispatch: () => {} },
        resolveDashboardConfig,
        ctx,
        initializeDashboard(config),
    ).toPromise();

    return { resolved, getSettingsForCurrentUser, backendWorkspace: workspace };
}

describe("resolveDashboardConfig", () => {
    // The list is empty in the source. vi.mock cannot replace it: with `isolate: false` the sanitizer
    // may already hold the real module from an earlier test file.
    beforeEach(() => {
        disabledUnfinishedFeatureSettings["unfinishedFeature"] = false;
    });

    afterEach(() => {
        delete disabledUnfinishedFeatureSettings["unfinishedFeature"];
    });

    it("should use backend settings when the host passes none", async () => {
        const { resolved } = await resolve(baseConfig);

        expect(resolved.settings).toEqual({
            enableDashboardPersistentFiltersAcrossTabs: true,
            sharedKey: "backend",
            unfinishedFeature: false,
        });
    });

    it("should keep backend settings next to the settings passed by the host", async () => {
        const { resolved, getSettingsForCurrentUser } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true },
        });

        expect(getSettingsForCurrentUser).toHaveBeenCalledTimes(1);
        expect(resolved.settings).toMatchObject({
            someHostKey: true,
            enableDashboardPersistentFiltersAcrossTabs: true,
        });
    });

    it("should let the host override a backend setting", async () => {
        const { resolved } = await resolve({
            ...baseConfig,
            settings: { sharedKey: "host", enableDashboardPersistentFiltersAcrossTabs: false },
        });

        expect(resolved.settings).toMatchObject({
            sharedKey: "host",
            enableDashboardPersistentFiltersAcrossTabs: false,
        });
    });

    it("should not leak user and workspace props of the backend response into the merged settings", async () => {
        const { resolved } = await resolve({ ...baseConfig, settings: { someHostKey: true } });

        expect(resolved.settings).not.toHaveProperty("userId");
        expect(resolved.settings).not.toHaveProperty("workspace");
        expect(resolved.settings).not.toHaveProperty("locale");
        expect(resolved.settings).not.toHaveProperty("separators");
    });

    it("should turn off unfinished features in the merged settings", async () => {
        const { resolved } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true, unfinishedFeature: true },
        });

        expect(resolved.settings).toMatchObject({ someHostKey: true, unfinishedFeature: false });
    });

    it("should keep unfinished features of the merged settings when allowUnfinishedFeatures is set", async () => {
        const { resolved } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true },
            allowUnfinishedFeatures: true,
        });

        expect(resolved.settings).toMatchObject({ someHostKey: true, unfinishedFeature: true });
    });

    it("should take backend-derived config values from the merged settings", async () => {
        const { resolved } = await resolve(
            { ...baseConfig, settings: { someHostKey: true } },
            { ...backendSettings, mapboxToken: "backend-mapbox", whiteLabeling: { enabled: true } },
        );

        expect(resolved.mapboxToken).toBe("backend-mapbox");
        expect(resolved.isWhiteLabeled).toBe(true);
    });

    it("should not call the backend and should use only host settings when the config is fully resolved", async () => {
        const { resolved, backendWorkspace } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true },
            locale: "en-US",
            separators,
        });

        expect(backendWorkspace).not.toHaveBeenCalled();
        expect(resolved.settings).toEqual({ someHostKey: true, unfinishedFeature: false });
    });

    it("should not load backend settings when the host passes settings, locale and separators", async () => {
        const { resolved, getSettingsForCurrentUser } = await resolve({
            settings: { someHostKey: true },
            locale: "en-US",
            separators,
        });

        expect(getSettingsForCurrentUser).not.toHaveBeenCalled();
        expect(resolved.settings).toEqual({ someHostKey: true, unfinishedFeature: false });
    });

    it("should merge settings and take separators from the backend when the host passes only locale", async () => {
        const { resolved } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true },
            locale: "de-DE",
        });

        expect(resolved.locale).toBe("de-DE");
        expect(resolved.separators).toEqual(separators);
        expect(resolved.settings).toMatchObject({
            someHostKey: true,
            enableDashboardPersistentFiltersAcrossTabs: true,
        });
    });

    it("should merge settings and take locale from the backend when the host passes only separators", async () => {
        const hostSeparators: ISeparators = { thousand: " ", decimal: "," };
        const { resolved } = await resolve({
            ...baseConfig,
            settings: { someHostKey: true },
            separators: hostSeparators,
        });

        expect(resolved.locale).toBe("en-US");
        expect(resolved.separators).toEqual(hostSeparators);
        expect(resolved.settings).toMatchObject({
            someHostKey: true,
            enableDashboardPersistentFiltersAcrossTabs: true,
        });
    });
});
