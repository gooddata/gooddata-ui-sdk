// (C) 2019-2022 GoodData Corporation
import {
    IAnalyticalBackend,
    IDashboard,
    IDashboardReferences,
    IDashboardWithReferences,
    IGetDashboardOptions,
    IWorkspaceDashboardsService,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import {
    decoratedBackend,
    DecoratedWorkspaceDashboardsService,
    withEventing,
} from "@gooddata/sdk-backend-base";
import { IExecutionDefinition, ObjRef } from "@gooddata/sdk-model";

export type CapturedData = {
    dashboards: string[];
    executions: IExecutionDefinition[];
    insights: string[];
    // elements: any[];
};

function ensureCapturedDataInitialized() {
    if (!window["CapturedData"]) {
        window["CapturedData"] = { dashboards: [], executions: {}, insights: [] };
    }
}

function captureDashboard(id: string) {
    ensureCapturedDataInitialized();

    window["CapturedData"].dashboards.push(id);
}

function captureExecution(executionDefinition: IExecutionDefinition) {
    ensureCapturedDataInitialized();

    window["CapturedData"].executions.push(executionDefinition);
}

function captureInsight(id: string) {
    ensureCapturedDataInitialized();

    window["CapturedData"].insights.push(id);
}

// TODO: RAIL-3888 - migrate to eventing dashboard?
class WithDashboardsCapturing extends DecoratedWorkspaceDashboardsService {
    constructor(protected decorated: IWorkspaceDashboardsService, public workspace: string) {
        super(decorated, workspace);
    }

    public async getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences> {
        const dashboardWithReferences = await this.decorated.getDashboardWithReferences(
            ref,
            filterContextRef,
            options,
            types,
        );

        captureDashboard(dashboardWithReferences.dashboard.identifier);
        dashboardWithReferences.references.insights.forEach((i) => captureInsight(i.insight.identifier));

        return dashboardWithReferences;
    }

    public async getDashboardReferencedObjects(
        dashboard: IDashboard,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences> {
        const dashboardReferences = await this.decorated.getDashboardReferencedObjects(dashboard, types);

        dashboardReferences.insights.forEach((i) => captureInsight(i.insight.identifier));

        return dashboardReferences;
    }
}

export function withCapturing(backend: IAnalyticalBackend): IAnalyticalBackend {
    return withEventing(
        decoratedBackend(backend, {
            dashboards: (original, workspace) => new WithDashboardsCapturing(original, workspace),
        }),
        {
            beforeExecute: (def) => captureExecution(def),
        },
    );
}
