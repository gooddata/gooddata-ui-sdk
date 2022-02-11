// (C) 2020-2022 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import noop from "lodash/noop";

import { getWorkspaceSettingsLoader, resetWorkspaceSettingsLoader } from "../workspaceSettingsLoader";

describe("WorkspaceSettingsLoader", () => {
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
        resetWorkspaceSettingsLoader();
    });

    it("should cache getSettingsForCurrentUser calls", async () => {
        const loader = getWorkspaceSettingsLoader();
        const getSettingsForCurrentUser = jest.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getSettingsForCurrentUser);

        const first = loader.load(backend, workspace);
        const second = loader.load(backend, workspace);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getSettingsForCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should not cache getSettingsForCurrentUser errors", async () => {
        const loader = getWorkspaceSettingsLoader();
        const getSettingsForCurrentUser = jest.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getSettingsForCurrentUser);

        try {
            await loader.load(errorBackend, workspace);
        } catch {
            // do nothing
        }

        await loader.load(successBackend, workspace);

        expect(getSettingsForCurrentUser).toHaveBeenCalledTimes(1);
    });
});
