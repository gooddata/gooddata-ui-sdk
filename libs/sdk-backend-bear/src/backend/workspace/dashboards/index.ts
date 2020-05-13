// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceDashboards,
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { GdcDashboard, GdcMetadata, GdcFilterContext } from "@gooddata/gd-bear-model";

import { BearAuthenticatedCallGuard } from "../../../types";
import {
    convertListedDashboard,
    convertDashboard,
    BearDashboardDependency,
} from "../../../toSdkModel/DashboardConverter";
import { objRefToUri } from "../../../fromObjRef/api";

type DashboardDependencyCategory = Extract<
    GdcMetadata.ObjectCategory,
    "kpi" | "visualizationWidget" | "filterContext"
>;

const DASHBOARD_DEPENDENCIES_TYPES: DashboardDependencyCategory[] = [
    "kpi",
    "visualizationWidget",
    "filterContext",
];

export class BearWorkspaceDashboards implements IWorkspaceDashboards {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const dashboardsObjectLinks = await this.authCall(sdk =>
            sdk.md.getAnalyticalDashboards(this.workspace),
        );
        const dashboards = dashboardsObjectLinks.map(convertListedDashboard);
        return dashboards;
    };

    public getDashboard = async (dashboardRef: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> => {
        const [dashboardUri, filterContextUri] = await Promise.all([
            objRefToUri(dashboardRef, this.workspace, this.authCall),
            filterContextRef ? objRefToUri(filterContextRef, this.workspace, this.authCall) : undefined,
        ]);

        const [bearDashboard, bearDependencies, bearFilterContext] = await Promise.all([
            this.authCall(sdk =>
                sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(dashboardUri),
            ),
            this.loadDashboardDependencies(dashboardUri),
            filterContextUri
                ? this.authCall(sdk =>
                      sdk.md.getObjectDetails<
                          GdcFilterContext.IWrappedFilterContext | GdcFilterContext.IWrappedTempFilterContext
                      >(dashboardUri),
                  )
                : undefined,
        ]);

        if (bearFilterContext) {
            bearDashboard.analyticalDashboard.content.filterContext = filterContextUri;
            bearDependencies.push(bearFilterContext);
        }

        const sdkDashboard = convertDashboard(bearDashboard, bearDependencies);

        return sdkDashboard;
    };

    public async createDashboard(_dashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    public async updateDashboard(_dashboard: IDashboard, _updatedDashboard: IDashboard): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    public async deleteDashboard(_dashboardRef: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    private loadDashboardDependencies = async (dashboardUri: string) => {
        const dependenciesObjectLinks = await this.authCall(sdk =>
            sdk.md.getObjectUsing(this.workspace, dashboardUri, {
                types: DASHBOARD_DEPENDENCIES_TYPES,
                nearest: false,
            }),
        );
        const dependenciesUris = dependenciesObjectLinks.map(objectLink => objectLink.link);
        const dependenciesMetadataObjects = await this.authCall(sdk =>
            sdk.md.getObjects<BearDashboardDependency>(this.workspace, dependenciesUris),
        );

        return dependenciesMetadataObjects;
    };
}
