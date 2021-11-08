// (C) 2020-2021 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import noop from "lodash/noop";

import { getWorkspaceSettingsLoader, resetWorkspaceSettingsLoader } from "../workspaceSettingsLoader";

describe("WorkspaceSettingsLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (getSettings: () => Promise<IWorkspaceSettings>): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            settings: () => ({
                getSettingsForCurrentUser: noop as any,
                getSettings,
            }),
        }),
    });

    beforeEach(() => {
        resetWorkspaceSettingsLoader();
    });

    it("should cache getSettings calls", async () => {
        const loader = getWorkspaceSettingsLoader();
        const getSettings = jest.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getSettings);

        const first = loader.load(backend, workspace);
        const second = loader.load(backend, workspace);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getSettings).toHaveBeenCalledTimes(1);
    });

    it("should not cache getSettings errors", async () => {
        const loader = getWorkspaceSettingsLoader();
        const getSettings = jest.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getSettings);

        try {
            await loader.load(errorBackend, workspace);
        } catch {
            // do nothing
        }

        await loader.load(successBackend, workspace);

        expect(getSettings).toHaveBeenCalledTimes(1);
    });
});
