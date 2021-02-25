// (C) 2020-2021 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

import { userWorkspacePermissionsDataLoaderFactory } from "../UserWorkspacePermissionsDataLoader";

describe("UserWorkspacePermissionsDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (
        getPermissionsForCurrentUser: () => Promise<IWorkspacePermissions>,
    ): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            permissions: () => ({
                getPermissionsForCurrentUser,
            }),
        }),
    });

    beforeEach(() => {
        userWorkspacePermissionsDataLoaderFactory.reset();
    });

    it("should cache getUserWorkspacePermissions calls", async () => {
        const loader = userWorkspacePermissionsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspacePermissions = jest.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getUserWorkspacePermissions);

        const first = loader.getUserWorkspacePermissions(backend);
        const second = loader.getUserWorkspacePermissions(backend);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getUserWorkspacePermissions).toHaveBeenCalledTimes(1);
    });

    it("should not cache getUserWorkspacePermissions errors", async () => {
        const loader = userWorkspacePermissionsDataLoaderFactory.forWorkspace(workspace);
        const getUserWorkspacePermissions = jest.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getUserWorkspacePermissions);

        try {
            await loader.getUserWorkspacePermissions(errorBackend);
        } catch {
            // do nothing
        }

        await loader.getUserWorkspacePermissions(successBackend);

        expect(getUserWorkspacePermissions).toHaveBeenCalledTimes(1);
    });
});
