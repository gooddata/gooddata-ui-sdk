// (C) 2020-2022 GoodData Corporation
import noop from "lodash/noop.js";
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { userWorkspaceSettingsDataLoaderFactory } from "../UserWorkspaceSettingsDataLoader.js";

describe("UserWorkspaceSettingsDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (
        getSettingsForCurrentUser: () => Promise<IUserWorkspaceSettings>,
    ): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            settings: () => ({
                getSettingsForCurrentUser,
                getSettings: noop as any,
                setLocale: (_locale: string) => Promise.resolve(),
                setTheme: (_themeId: string) => Promise.resolve(),
                setColorPalette: (_colorPaletteId: string) => Promise.resolve(),
            }),
        }),
    });

    beforeEach(() => {
        userWorkspaceSettingsDataLoaderFactory.reset();
    });

    it("should cache getUserWorkspaceSettings calls", async () => {
        const loader = userWorkspaceSettingsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspaceSettings = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getUserWorkspaceSettings);

        const first = loader.getUserWorkspaceSettings(backend);
        const second = loader.getUserWorkspaceSettings(backend);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getUserWorkspaceSettings).toHaveBeenCalledTimes(1);
    });

    it("should not cache getUserWorkspaceSettings errors", async () => {
        const loader = userWorkspaceSettingsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspaceSettings = vi.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getUserWorkspaceSettings);

        try {
            await loader.getUserWorkspaceSettings(errorBackend);
        } catch {
            // do nothing
        }

        await loader.getUserWorkspaceSettings(successBackend);

        expect(getUserWorkspaceSettings).toHaveBeenCalledTimes(1);
    });
});
