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

    public getDashboard = async (
        dashboardRef: ObjRef,
        exportFilterContextRef?: ObjRef,
    ): Promise<IDashboard> => {
        const [dashboardUri, exportFilterContextUri] = await Promise.all([
            objRefToUri(dashboardRef, this.workspace, this.authCall),
            exportFilterContextRef
                ? objRefToUri(exportFilterContextRef, this.workspace, this.authCall)
                : undefined,
        ]);

        const [bearDashboard, bearDependencies, bearExportFilterContext] = await Promise.all([
            this.authCall(sdk =>
                sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(dashboardUri),
            ),
            this.loadDashboardDependencies(dashboardUri),
            exportFilterContextUri ? this.loadExportFilterContext(exportFilterContextUri) : undefined,
        ] as const);

        if (bearExportFilterContext) {
            bearDashboard.analyticalDashboard.content.filterContext = exportFilterContextUri;
            bearDependencies.push(bearExportFilterContext);
        }

        const sdkDashboard = convertDashboard(bearDashboard, bearDependencies, exportFilterContextUri);

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

    private loadExportFilterContext = async (
        exportFilterContextUri: string,
    ): Promise<
        GdcFilterContext.IWrappedFilterContext | GdcFilterContext.IWrappedTempFilterContext | undefined
    > => {
        const exportFilterContext = await this.authCall(async sdk => {
            let result:
                | GdcFilterContext.IWrappedFilterContext
                | GdcFilterContext.IWrappedTempFilterContext
                | undefined;

            try {
                result = await sdk.md.getObjectDetails<
                    GdcFilterContext.IWrappedFilterContext | GdcFilterContext.IWrappedTempFilterContext
                >(exportFilterContextUri);
            } catch (err) {
                if (err?.response?.status === 404) {
                    // Error can sign, that export filter context expired
                    // TODO: investigate if the status is correct
                    result = undefined;
                }

                // let other errors propagate correctly
                throw err;
            }

            return result;
        });

        return exportFilterContext;
    };

    private loadDashboardDependencies = async (dashboardUri: string): Promise<BearDashboardDependency[]> => {
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
