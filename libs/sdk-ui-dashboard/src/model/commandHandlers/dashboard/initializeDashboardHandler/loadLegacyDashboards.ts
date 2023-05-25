// (C) 2019-2022 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { ILegacyDashboard, ILegacyDashboardTab } from "../../../../types.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export async function loadLegacyDashboards(ctx: DashboardContext): Promise<ILegacyDashboard[]> {
    const dashboardResponse = await getProjectDashboards(ctx.backend, ctx.workspace);

    if (!dashboardResponse) {
        return [];
    }

    return projectDashboardToLegacyDashboard(dashboardResponse);
}

function emptyPromise() {
    return Promise.resolve();
}

function unwrapDecoratedBackend(backend: any): any {
    if (backend?.decorated) {
        return unwrapDecoratedBackend(backend.decorated);
    }

    return backend;
}

type AuthApiCall = (call: (client: any) => Promise<any>) => any;

function getBackendAuthApiCallPrivateMethod(backend: any): AuthApiCall {
    return backend.authApiCall ?? emptyPromise;
}

function getBearProjectDashboardMethod(client: any): GetProjectDashboards {
    const method = client?.md?.getProjectDashboards.bind(client?.md);

    return method ?? emptyPromise;
}

type GetProjectDashboards = (workspace: string) => Promise<any>;

async function getProjectDashboards(backend: any, workspace: string): Promise<any> {
    const unwrappedBackend = unwrapDecoratedBackend(backend);
    const authApiCall = getBackendAuthApiCallPrivateMethod(unwrappedBackend);

    return authApiCall(async (client) => {
        const projectDashboardMethod = getBearProjectDashboardMethod(client);

        return projectDashboardMethod(workspace);
    });
}

function projectDashboardToLegacyDashboard(data: any): ILegacyDashboard[] {
    return data.map((item: any) => {
        const { content, meta } = item.projectDashboard;
        return {
            identifier: meta.identifier!,
            uri: meta.uri!,
            ref: uriRef(meta.uri!),
            title: meta.title,
            tabs: content.tabs.map((tab: any): ILegacyDashboardTab => {
                return {
                    identifier: tab.identifier,
                    title: tab.title,
                };
            }),
        };
    });
}
