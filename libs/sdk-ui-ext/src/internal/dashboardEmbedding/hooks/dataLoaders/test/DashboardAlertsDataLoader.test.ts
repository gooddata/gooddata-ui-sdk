// (C) 2020-2021 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { idRef, ObjRef } from "@gooddata/sdk-model";

import { dashboardAlertsDataLoaderFactory } from "../DashboardAlertsDataLoader";
import { noopWorkspaceDashboardsService } from "./dataLoaders.mock";

describe("DashboardAlertsDataLoader.test", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (
        getDashboardWidgetAlertsForCurrentUser: (ref: ObjRef) => Promise<IWidgetAlert[]>,
    ): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            dashboards: () => ({
                ...noopWorkspaceDashboardsService,
                getDashboardWidgetAlertsForCurrentUser,
            }),
        }),
    });

    beforeEach(() => {
        dashboardAlertsDataLoaderFactory.reset();
    });

    it("should cache getDashboardAlerts calls", async () => {
        const loader = dashboardAlertsDataLoaderFactory.forWorkspace(workspace);
        const getDashboardWidgetAlertsForCurrentUser = jest.fn(() => Promise.resolve([]));
        const backend = getMockBackend(getDashboardWidgetAlertsForCurrentUser);

        const ref = idRef("foo");

        const first = loader.getDashboardAlerts(backend, ref);
        const second = loader.getDashboardAlerts(backend, ref);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getDashboardWidgetAlertsForCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should not cache getDashboardAlerts errors", async () => {
        const loader = dashboardAlertsDataLoaderFactory.forWorkspace(workspace);
        const getDashboardWidgetAlertsForCurrentUser = jest.fn(() => Promise.resolve([]));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getDashboardWidgetAlertsForCurrentUser);

        const ref = idRef("foo");

        try {
            await loader.getDashboardAlerts(errorBackend, ref);
        } catch {
            // do nothing
        }

        await loader.getDashboardAlerts(successBackend, ref);

        expect(getDashboardWidgetAlertsForCurrentUser).toHaveBeenCalledTimes(1);
    });
});
