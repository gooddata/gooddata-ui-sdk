// (C) 2020-2021 GoodData Corporation
import noop from "lodash/noop";
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import {
    IAnalyticalBackend,
    IDashboard,
    IWidgetAlert,
    IWorkspaceDashboardsService,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { idRef, ObjRef } from "@gooddata/sdk-model";

import {
    getDashboardViewDataLoader,
    clearDashboardViewCaches,
    DashboardViewDataLoader,
} from "../dataLoaders";

describe("getDashboardViewDataLoader", () => {
    const workspace = "foo";

    beforeEach(() => {
        clearDashboardViewCaches();
    });

    it("should return the same instance of loader for the same workspace", () => {
        const first = getDashboardViewDataLoader(workspace);
        const second = getDashboardViewDataLoader(workspace);

        expect(second).toBe(first);
    });

    it("should return different instances of loader for different workspaces", () => {
        const first = getDashboardViewDataLoader("foo");
        const second = getDashboardViewDataLoader("bar");

        expect(second).not.toBe(first);
    });

    it("should return different instance of loader for the same workspace if the cache has been cleared", () => {
        const first = getDashboardViewDataLoader(workspace);

        clearDashboardViewCaches();

        const second = getDashboardViewDataLoader(workspace);

        expect(second).not.toBe(first);
    });
});

describe("DashboardViewDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();
    const noopWorkspaceDashboardsService: IWorkspaceDashboardsService = {
        createDashboard: noop as any,
        createScheduledMail: noop as any,
        createWidgetAlert: noop as any,
        deleteDashboard: noop as any,
        deleteWidgetAlert: noop as any,
        deleteWidgetAlerts: noop as any,
        exportDashboardToPdf: noop as any,
        getDashboard: noop as any,
        getDashboardWidgetAlertsForCurrentUser: noop as any,
        getAllWidgetAlertsForCurrentUser: noop as any,
        getDashboards: noop as any,
        getResolvedFiltersForWidget: noop as any,
        getScheduledMailsCountForDashboard: noop as any,
        getWidgetAlertsCountForWidgets: noop as any,
        getWidgetReferencedObjects: noop as any,
        updateDashboard: noop as any,
        updateWidgetAlert: noop as any,
        workspace: "workspace",
    };

    describe("getUserWorkspacePermissions calls", () => {
        const defaultUserPermissions: IWorkspacePermissions = {
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateReport: true,
            canCreateScheduledMail: true,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: true,
            canInitData: true,
            canListUsersInProject: true,
            canManageAnalyticalDashboard: true,
            canManageDomain: true,
            canManageMetric: true,
            canManageProject: true,
            canManageReport: true,
            canUploadNonProductionCSV: true,
        };
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

        it("should cache getUserWorkspacePermissions calls", async () => {
            const loader = new DashboardViewDataLoader(workspace);
            const getSettingsForCurrentUser = jest.fn(() => Promise.resolve(defaultUserPermissions));
            const backend = getMockBackend(getSettingsForCurrentUser);

            const first = loader.getUserWorkspacePermissions(backend);
            const second = loader.getUserWorkspacePermissions(backend);

            const [firstResult, secondResult] = await Promise.all([first, second]);

            expect(secondResult).toBe(firstResult);
            expect(getSettingsForCurrentUser).toHaveBeenCalledTimes(1);
        });

        it("should not cache getUserWorkspacePermissions errors", async () => {
            const loader = new DashboardViewDataLoader(workspace);
            const getSettingsForCurrentUser = jest.fn(() => Promise.resolve(defaultUserPermissions));
            const errorBackend = getMockBackend(() => {
                throw new Error("FAIL");
            });
            const successBackend = getMockBackend(getSettingsForCurrentUser);

            try {
                await loader.getUserWorkspacePermissions(errorBackend);
            } catch {
                // do nothing
            }

            await loader.getUserWorkspacePermissions(successBackend);

            expect(getSettingsForCurrentUser).toHaveBeenCalledTimes(1);
        });
    });

    describe("getDashboard calls", () => {
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

        it("should cache getDashboard calls", async () => {
            const loader = new DashboardViewDataLoader(workspace);
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
            const loader = new DashboardViewDataLoader(workspace);
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

    describe("getDashboardAlerts calls", () => {
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

        it("should cache getDashboardAlerts calls", async () => {
            const loader = new DashboardViewDataLoader(workspace);
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
            const loader = new DashboardViewDataLoader(workspace);
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
});
