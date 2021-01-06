// (C) 2020-2021 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IDashboard } from "@gooddata/sdk-backend-spi";
import { idRef, ObjRef } from "@gooddata/sdk-model";

import { dashboardDataLoaderFactory } from "../DashboardDataLoader";
import { noopWorkspaceDashboardsService } from "./dataLoaders.mock";

describe("DashboardDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (getDashboard: (ref: ObjRef) => Promise<IDashboard>): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            dashboards: () => ({
                ...noopWorkspaceDashboardsService,
                getDashboard,
            }),
        }),
    });

    beforeEach(() => {
        dashboardDataLoaderFactory.reset();
    });

    it("should cache getDashboard calls", async () => {
        const loader = dashboardDataLoaderFactory.forWorkspace(workspace);
        const getDashboard = jest.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getDashboard);

        const ref = idRef("foo");

        const first = loader.getDashboard(backend, ref);
        const second = loader.getDashboard(backend, ref);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getDashboard).toHaveBeenCalledTimes(1);
    });

    it("should not cache getDashboard errors", async () => {
        const loader = dashboardDataLoaderFactory.forWorkspace(workspace);
        const getDashboard = jest.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getDashboard);

        const ref = idRef("foo");

        try {
            await loader.getDashboard(errorBackend, ref);
        } catch {
            // do nothing
        }

        await loader.getDashboard(successBackend, ref);

        expect(getDashboard).toHaveBeenCalledTimes(1);
    });
});
