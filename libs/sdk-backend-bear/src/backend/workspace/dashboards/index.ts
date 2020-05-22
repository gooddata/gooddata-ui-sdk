// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceDashboards,
    IDashboard,
    IListedDashboard,
    NotSupported,
    IDashboardDefinition,
    IWidget,
    IWidgetDefinition,
    isWidgetDefinition,
    isWidget,
    IFluidLayout,
    IFilterContext,
    IFilterContextDefinition,
    isFilterContextDefinition,
    ITempFilterContext,
    isFilterContext,
    isTempFilterContext,
    layoutWidgetsWithPaths,
    IWidgetWithLayoutPath,
    IWidgetOrDefinitionWithLayoutPath,
    Layout,
    LayoutDefinition,
    IWidgetDefinitionWithLayoutPath,
    layoutWidgets,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, areObjRefsEqual, uriRef } from "@gooddata/sdk-model";
import {
    GdcDashboard,
    GdcMetadata,
    GdcFilterContext,
    GdcVisualizationClass,
    GdcMetadataObject,
} from "@gooddata/gd-bear-model";
import { BearAuthenticatedCallGuard } from "../../../types";
import * as fromSdkModel from "../../../fromSdkModel/DashboardConverter";
import * as toSdkModel from "../../../toSdkModel/DashboardConverter";
import { objRefToUri } from "../../../fromObjRef/api";
import isEqual from "lodash/isEqual";
import clone from "lodash/clone";
import set from "lodash/set";
import { getObjectIdFromUri } from "../../../utils/api";

type DashboardDependencyCategory = Extract<
    GdcMetadata.ObjectCategory,
    "kpi" | "visualizationWidget" | "visualizationObject" | "filterContext"
>;

const DASHBOARD_DEPENDENCIES_TYPES: DashboardDependencyCategory[] = [
    "kpi",
    "visualizationWidget",
    "visualizationObject",
    "filterContext",
];

export class BearWorkspaceDashboards implements IWorkspaceDashboards {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const dashboardsObjectLinks = await this.authCall(sdk =>
            sdk.md.getAnalyticalDashboards(this.workspace),
        );
        const dashboards = dashboardsObjectLinks.map(toSdkModel.convertListedDashboard);
        return dashboards;
    };

    public getDashboard = async (
        dashboardRef: ObjRef,
        exportFilterContextRef?: ObjRef,
    ): Promise<IDashboard> => {
        const exportFilterContextUri = exportFilterContextRef
            ? await objRefToUri(exportFilterContextRef, this.workspace, this.authCall)
            : undefined;

        const [
            bearDashboard,
            bearDependencies,
            bearExportFilterContext,
            bearVisualizationClasses,
        ] = await Promise.all([
            this.getBearDashboard(dashboardRef),
            this.getBearDashboardDependencies(dashboardRef),
            this.getBearExportFilterContext(exportFilterContextRef),
            this.getBearVisualizationClasses(),
        ] as const);

        if (bearExportFilterContext) {
            bearDashboard.analyticalDashboard.content.filterContext = exportFilterContextUri;
            bearDependencies.push(bearExportFilterContext);
        }

        const sdkDashboard = toSdkModel.convertDashboard(
            bearDashboard,
            bearDependencies,
            bearVisualizationClasses,
            exportFilterContextUri,
        );

        return sdkDashboard;
    };

    public async createDashboard(dashboard: IDashboardDefinition): Promise<IDashboard> {
        const emptyDashboard: IDashboardDefinition = {
            description: "",
            filterContext: undefined,
            scheduledMails: [],
            title: "",
        };

        return this.updateDashboard(emptyDashboard as IDashboard, dashboard);
    }

    public async updateDashboard(
        originalDashboard: IDashboard,
        updatedDashboard: IDashboardDefinition,
    ): Promise<IDashboard> {
        if (!areObjRefsEqual(originalDashboard.ref, updatedDashboard.ref)) {
            throw new Error("Cannot update dashboard with different refs!");
        }

        const [filterContext, layout] = await Promise.all([
            this.updateFilterContext(originalDashboard.filterContext, updatedDashboard.filterContext),
            this.updateDashboardLayoutAndWidgets(originalDashboard.layout, updatedDashboard.layout),
        ] as const);

        // Missing refs means that the dashboard is not yet stored, so let's create it
        if (!originalDashboard.ref && !updatedDashboard.ref) {
            const createdDashboardWithSavedDependencies: IDashboardDefinition = {
                ...updatedDashboard,
                filterContext,
                layout,
            };

            return this.createBearDashboard(createdDashboardWithSavedDependencies);
        }

        const updatedDashboardWithSavedDependencies: IDashboard = {
            ...updatedDashboard,
            scheduledMails: [], // TODO https://jira.intgdc.com/browse/RAIL-2220
            created: originalDashboard.created, // update returns only the uri, so keep the old date
            updated: originalDashboard.updated, // update returns only the uri, so keep the old date
            ref: originalDashboard.ref,
            uri: originalDashboard.uri,
            identifier: originalDashboard.identifier,
            filterContext,
            layout,
        };
        await this.updateBearDashboard(updatedDashboardWithSavedDependencies);

        // Delete widgets after removing references to them in the dashboard
        // or backend throws the error that we are removing the dashboard dependency
        const deletedWidgets = this.collectDeletedWidgets(originalDashboard.layout, updatedDashboard.layout);
        await this.deleteWidgets(deletedWidgets);

        return updatedDashboardWithSavedDependencies;
    }

    public async deleteDashboard(_dashboardRef: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    private updateBearDashboard = async (dashboard: IDashboard): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        await this.updateBearMetadataObject(dashboard.ref, bearDashboard);
        return dashboard;
    };

    private updateFilterContext = async (
        originalFilterContext: IFilterContext | ITempFilterContext | undefined,
        updatedFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
    ): Promise<IFilterContext | ITempFilterContext | undefined> => {
        if (isFilterContextDefinition(updatedFilterContext)) {
            // Create a new filter context
            return this.createBearFilterContext(updatedFilterContext);
        } else if (isFilterContext(updatedFilterContext) || isTempFilterContext(updatedFilterContext)) {
            // Update the current filter context
            const shouldUpdateFilterContext = !isEqual(originalFilterContext, updatedFilterContext);
            if (shouldUpdateFilterContext) {
                return this.updateBearFilterContext(updatedFilterContext);
            }
        }

        // No change, return the original filter context
        return originalFilterContext;
    };

    private updateDashboardLayoutAndWidgets = async (
        originalLayout: Layout | undefined,
        updatedLayout: Layout | LayoutDefinition | undefined,
    ): Promise<Layout | undefined> => {
        if (!updatedLayout) {
            return;
        }

        // Layout is now source of the truth, so collect relevant widgets and their layout paths
        // from both original and updated layout
        const createdWidgetsWithLayoutPaths = this.collectCreatedWidgetsWithLayoutPaths(updatedLayout);
        const updatedWidgetsWithLayoutPaths = this.collectUpdatedWidgetsWithLayoutPaths(
            originalLayout,
            updatedLayout,
        );

        // Perform relevant operation (create/update) on each widget,
        // and replace widget definitions with saved widgets
        const createdAndUpdatedWidgetsWithLayoutPaths = await Promise.all([
            ...createdWidgetsWithLayoutPaths.map(widgetWithpath =>
                this.createBearWidget(widgetWithpath.widget).then(widget => ({ ...widgetWithpath, widget })),
            ),
            ...updatedWidgetsWithLayoutPaths.map(widgetWithpath =>
                this.updateBearWidget(widgetWithpath.widget).then(widget => ({ ...widgetWithpath, widget })),
            ),
        ]);

        // Update relevant parts of the layout with saved widgets
        const layout = createdAndUpdatedWidgetsWithLayoutPaths.reduce((acc, widgetWithPath) => {
            const updated = set(acc, widgetWithPath.path, widgetWithPath.widget);
            return updated;
        }, clone(updatedLayout) as IFluidLayout);

        return layout;
    };

    private collectCreatedWidgetsWithLayoutPaths = (
        updatedLayout: Layout | LayoutDefinition | undefined,
    ): IWidgetOrDefinitionWithLayoutPath[] => {
        const widgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        const createdWidgets: IWidgetDefinitionWithLayoutPath[] = widgetsWithPath.filter(({ widget }) =>
            isWidgetDefinition(widget),
        );

        return createdWidgets;
    };

    private collectUpdatedWidgetsWithLayoutPaths = (
        originalLayout: Layout | undefined,
        updatedLayout: Layout | LayoutDefinition | undefined,
    ) => {
        const originalLayoutWidgetsWithPath = originalLayout ? layoutWidgetsWithPaths(originalLayout) : [];

        const updatedLayoutWidgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        const updatedWidgetsWithPath = updatedLayoutWidgetsWithPath.filter(({ widget }) => {
            return (
                isWidget(widget) &&
                originalLayoutWidgetsWithPath.some(
                    w =>
                        isWidget(w.widget) &&
                        areObjRefsEqual(widget.ref, w.widget.ref) &&
                        !isEqual(widget, w.widget),
                )
            );
        }) as IWidgetWithLayoutPath[];

        return updatedWidgetsWithPath;
    };

    private collectDeletedWidgets = (
        originalLayout: Layout | undefined,
        updatedLayout: Layout | LayoutDefinition | undefined,
    ): IWidget[] => {
        const originalLayoutWidgets = originalLayout ? layoutWidgets(originalLayout) : [];
        const updatedLayoutWidgets = updatedLayout ? layoutWidgets(updatedLayout) : [];
        const deletedWidgets = originalLayoutWidgets.filter(widget => {
            return (
                isWidget(widget) &&
                updatedLayoutWidgets.every(w => isWidget(w) && !areObjRefsEqual(widget.ref, w.ref))
            );
        });

        return deletedWidgets;
    };

    private createBearFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const bearFilterContext = fromSdkModel.convertFilterContext(
            filterContext,
        ) as GdcFilterContext.IWrappedFilterContext;
        const savedBearFilterContext = await this.authCall(sdk =>
            sdk.md.createObject(this.workspace, bearFilterContext),
        );
        const savedFilterContext = toSdkModel.convertFilterContext(savedBearFilterContext);
        return savedFilterContext;
    };

    private getBearDashboard = async (
        dashboardRef: ObjRef,
    ): Promise<GdcDashboard.IWrappedAnalyticalDashboard> => {
        const uri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        return this.authCall(sdk => sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(uri));
    };

    private createBearDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        const createdBearDashboard: GdcDashboard.IWrappedAnalyticalDashboard = await this.authCall(sdk =>
            sdk.md.createObject(this.workspace, bearDashboard),
        );
        const createdDashboardDependencies = await this.getBearDashboardDependencies(
            uriRef(createdBearDashboard.analyticalDashboard.meta.uri),
        );
        return toSdkModel.convertDashboard(createdBearDashboard, createdDashboardDependencies);
    };

    private getBearVisualizationClasses = async (): Promise<
        GdcVisualizationClass.IVisualizationClassWrapped[]
    > => {
        return this.authCall(
            (sdk): Promise<GdcVisualizationClass.IVisualizationClassWrapped[]> =>
                sdk.md.getObjectsByQuery(this.workspace, {
                    category: "visualizationClass",
                }),
        );
    };

    private updateBearFilterContext = async (
        filterContext: IFilterContext | ITempFilterContext,
    ): Promise<IFilterContext | ITempFilterContext> => {
        const bearFilterContext = fromSdkModel.convertFilterContext(filterContext);
        await this.updateBearMetadataObject(filterContext.ref, bearFilterContext);
        return filterContext;
    };

    private createBearWidget = async (widget: IWidgetDefinition): Promise<IWidget> => {
        const bearWidget = fromSdkModel.convertWidget(widget);
        const savedBearWidget = await this.authCall(sdk => sdk.md.createObject(this.workspace, bearWidget));
        const savedWidget = toSdkModel.convertWidget(savedBearWidget);
        return savedWidget;
    };

    private updateBearWidget = async (widget: IWidget): Promise<IWidget> => {
        const bearWidget = fromSdkModel.convertWidget(widget);
        await this.updateBearMetadataObject(widget.ref, bearWidget);
        return widget;
    };

    private updateBearMetadataObject = async (
        ref: ObjRef,
        bearMetadataObject: GdcMetadataObject.WrappedObject,
    ) => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const metadataObjectId = getObjectIdFromUri(uri);
        await this.authCall(sdk => sdk.md.updateObject(this.workspace, metadataObjectId, bearMetadataObject));
    };

    private deleteBearMetadataObject = async (ref: ObjRef) => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        return this.authCall(sdk => sdk.md.deleteObject(uri));
    };

    private getBearExportFilterContext = async (
        exportFilterContextRef: ObjRef | undefined,
    ): Promise<
        GdcFilterContext.IWrappedFilterContext | GdcFilterContext.IWrappedTempFilterContext | undefined
    > => {
        if (!exportFilterContextRef) {
            return;
        }

        const exportFilterContextUri = await objRefToUri(
            exportFilterContextRef,
            this.workspace,
            this.authCall,
        );

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

    private getBearDashboardDependencies = async (
        dashboardRef: ObjRef,
    ): Promise<toSdkModel.BearDashboardDependency[]> => {
        const uri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const dependenciesObjectLinks = await this.authCall(sdk =>
            sdk.md.getObjectUsing(this.workspace, uri, {
                types: DASHBOARD_DEPENDENCIES_TYPES,
                nearest: false,
            }),
        );
        const dependenciesUris = dependenciesObjectLinks.map(objectLink => objectLink.link);
        const dependenciesMetadataObjects = await this.authCall(sdk =>
            sdk.md.getObjects<toSdkModel.BearDashboardDependency>(this.workspace, dependenciesUris),
        );

        return dependenciesMetadataObjects;
    };

    private async deleteWidgets(widgets: IWidget[]): Promise<void> {
        await Promise.all(widgets.map(widget => this.deleteBearMetadataObject(widget.ref)));
    }
}
