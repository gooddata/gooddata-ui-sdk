// (C) 2019-2022 GoodData Corporation
import {
    IDashboard,
    IDashboardReferences,
    IDashboardWithReferences,
    IGetDashboardOptions,
    IWorkspaceDashboardsService,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { DecoratedWorkspaceDashboardsService } from "../decoratedBackend/dashboards";
import { AnalyticalBackendCallbacks } from "./types";

export class WithDashboardsEventing extends DecoratedWorkspaceDashboardsService {
    constructor(
        protected decorated: IWorkspaceDashboardsService,
        public workspace: string,
        protected callbacks: AnalyticalBackendCallbacks,
    ) {
        super(decorated, workspace);
    }

    public async getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences> {
        const dashboardWithReferences = await super.getDashboardWithReferences(
            ref,
            filterContextRef,
            options,
            types,
        );

        this.callbacks?.dashboards?.dashboardWithReferencesSuccess?.(dashboardWithReferences);
        return dashboardWithReferences;
    }

    public async getDashboardReferencedObjects(
        dashboard: IDashboard,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences> {
        const dashboardReferences = await super.getDashboardReferencedObjects(dashboard, types);
        this.callbacks?.dashboards?.dashboardWithReferencedObjectsSuccess?.(dashboardReferences);
        return dashboardReferences;
    }
}
