// (C) 2020-2021 GoodData Corporation
import noop from "lodash/noop";
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { userWorkspaceSettingsDataLoaderFactory } from "../UserWorkspaceSettingsDataLoader";

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
            }),
        }),
    });

    beforeEach(() => {
        userWorkspaceSettingsDataLoaderFactory.reset();
    });

    it("should cache getUserWorkspaceSettings calls", async () => {
        const loader = userWorkspaceSettingsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspaceSettings = jest.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getUserWorkspaceSettings);

        const first = loader.getUserWorkspaceSettings(backend);
        const second = loader.getUserWorkspaceSettings(backend);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getUserWorkspaceSettings).toHaveBeenCalledTimes(1);
    });

    it("should not cache getUserWorkspaceSettings errors", async () => {
        const loader = userWorkspaceSettingsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspaceSettings = jest.fn(() => Promise.resolve({} as any));
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
