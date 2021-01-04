// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceDashboardsService,
    IDashboard,
    IListedDashboard,
    IDashboardDefinition,
    IWidget,
    IWidgetDefinition,
    isWidgetDefinition,
    isWidget,
    IFilterContext,
    IFilterContextDefinition,
    isFilterContextDefinition,
    ITempFilterContext,
    isFilterContext,
    layoutWidgetsWithPaths,
    IWidgetWithLayoutPath,
    layoutWidgets,
    IWidgetAlert,
    IWidgetAlertDefinition,
    UnexpectedError,
    isTempFilterContext,
    IWidgetAlertCount,
    IScheduledMailDefinition,
    IScheduledMail,
    FilterContextItem,
    SupportedWidgetReferenceTypes,
    IWidgetReferences,
    widgetType,
    IDashboardLayout,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, areObjRefsEqual, uriRef, objRefToString, IFilter } from "@gooddata/sdk-model";
import {
    GdcDashboard,
    GdcMetadata,
    GdcFilterContext,
    GdcVisualizationClass,
    GdcMetadataObject,
} from "@gooddata/api-model-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import * as fromSdkModel from "../../../convertors/toBackend/DashboardConverter";
import * as toSdkModel from "../../../convertors/fromBackend/DashboardConverter";
import clone from "lodash/clone";
import flatten from "lodash/flatten";
import isEqual from "lodash/isEqual";
import set from "lodash/set";
import {
    objRefToUri,
    objRefsToUris,
    getObjectIdFromUri,
    userUriFromAuthenticatedPrincipalWithAnonymous,
} from "../../../utils/api";
import keyBy from "lodash/keyBy";
import { WidgetReferencesQuery } from "./widgetReferences";
import invariant from "ts-invariant";
import { resolveWidgetFilters } from "./widgetFilters";

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

export class BearWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods

    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const dashboardsObjectLinks = await this.authCall((sdk) =>
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

    public createDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const emptyDashboard: IDashboardDefinition = {
            description: "",
            filterContext: undefined,
            title: "",
        };

        return this.updateDashboard(emptyDashboard as IDashboard, dashboard);
    };

    public updateDashboard = async (
        originalDashboard: IDashboard,
        updatedDashboard: IDashboard | IDashboardDefinition,
    ): Promise<IDashboard> => {
        if (!areObjRefsEqual(originalDashboard.ref, updatedDashboard.ref)) {
            throw new Error("Cannot update dashboard with different refs!");
        } else if (isEqual(originalDashboard, updatedDashboard)) {
            return originalDashboard;
        }

        const [filterContext, layout] = await Promise.all([
            this.updateFilterContext(originalDashboard.filterContext, updatedDashboard.filterContext),
            this.updateLayoutAndWidgets(originalDashboard.layout, updatedDashboard.layout),
        ]);

        // Missing refs means that the dashboard is not yet stored, so let's create it
        if (!originalDashboard.ref && !updatedDashboard.ref) {
            const createdDashboardWithSavedDependencies: IDashboardDefinition = {
                ...updatedDashboard,
                filterContext,
                layout,
            };

            return this.createBearDashboard(createdDashboardWithSavedDependencies);
        }

        const { created, updated, ref, uri, identifier } = originalDashboard;
        const updatedDashboardWithSavedDependencies: IDashboard = {
            ...updatedDashboard,
            created, // update returns only the uri, so keep the old date
            updated, // update returns only the uri, so keep the old date
            ref,
            uri,
            identifier,
            filterContext,
            layout,
        };

        // First we need to delete any alerts referenced by the deleted widgets
        const deletedWidgets = this.collectDeletedWidgets(originalDashboard.layout, updatedDashboard.layout);

        const alertsToDelete = flatten(
            await Promise.all(deletedWidgets.map((widget) => this.getBearWidgetAlertsForWidget(widget))),
        );

        if (alertsToDelete.length) {
            await this.deleteWidgetAlerts(alertsToDelete);
        }

        // Then update the dashboard itself
        await this.updateBearDashboard(updatedDashboardWithSavedDependencies);

        // And finally delete the now orphaned widgets
        await this.deleteBearWidgets(deletedWidgets);

        return updatedDashboardWithSavedDependencies;
    };

    public deleteDashboard = async (dashboardRef: ObjRef): Promise<void> => {
        await this.deleteBearMetadataObject(dashboardRef);
    };

    public exportDashboardToPdf = async (
        dashboardRef: ObjRef,
        filters?: FilterContextItem[],
    ): Promise<string> => {
        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const convertedFilters = filters && filters.map(fromSdkModel.convertFilterContextItem);
        return this.authCall((sdk) =>
            sdk.dashboard.exportToPdf(this.workspace, dashboardUri, convertedFilters).then((res) => res.uri),
        );
    };

    public createScheduledMail = async (
        scheduledMailDefinition: IScheduledMailDefinition,
        exportFilterContextDefinition?: IFilterContextDefinition,
    ): Promise<IScheduledMail> => {
        const filterContext =
            exportFilterContextDefinition &&
            (await this.createBearFilterContext(exportFilterContextDefinition));
        const scheduledMailWithFilterContext = filterContext
            ? {
                  ...scheduledMailDefinition,
                  attachments: scheduledMailDefinition.attachments.map((attachment) => ({
                      ...attachment,
                      filterContext: filterContext.ref,
                  })),
              }
            : scheduledMailDefinition;
        const convertedScheduledMail = fromSdkModel.convertScheduledMail(scheduledMailWithFilterContext);
        const createdBearScheduledMail = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, convertedScheduledMail),
        );
        return toSdkModel.convertScheduledMail(createdBearScheduledMail) as IScheduledMail;
    };

    public getScheduledMailsCountForDashboard = async (dashboardRef: ObjRef): Promise<number> => {
        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const objectLinks = await this.authCall((sdk) =>
            sdk.md.getObjectUsedBy(this.workspace, dashboardUri, {
                nearest: true,
                types: ["scheduledMail"],
            }),
        );

        return objectLinks.length;
    };

    public getAllWidgetAlertsForCurrentUser = async (): Promise<IWidgetAlert[]> => {
        const alerts = await this.getAllBearKpiAlertsForCurrentUser();
        return this.getConvertedAlerts(alerts);
    };

    public getDashboardWidgetAlertsForCurrentUser = async (ref: ObjRef): Promise<IWidgetAlert[]> => {
        const alerts = await this.getDashboardBearKpiAlertsForCurrentUser(ref);
        return this.getConvertedAlerts(alerts);
    };

    public getWidgetAlertsCountForWidgets = async (refs: ObjRef[]): Promise<IWidgetAlertCount[]> => {
        const widgetUris = await Promise.all(
            refs.map((ref) => objRefToUri(ref, this.workspace, this.authCall)),
        );
        const result = await this.authCall((sdk) =>
            sdk.md.getObjectsUsedByMany(this.workspace, widgetUris, {
                types: ["kpiAlert"],
                nearest: true,
            }),
        );
        const convertedResult = result.map(
            (entry): IWidgetAlertCount => {
                return {
                    ref: uriRef(entry.uri),
                    alertCount: entry.entries.length,
                };
            },
        );
        return convertedResult;
    };

    public createWidgetAlert = async (alert: IWidgetAlertDefinition): Promise<IWidgetAlert> => {
        const savedFilterContext = await this.createOrUpdateWidgetAlertFilterContext(alert);
        const alertWithSavedFilterContext: IWidgetAlertDefinition = {
            ...alert,
            filterContext: savedFilterContext,
        };

        return this.createBearWidgetAlert(alertWithSavedFilterContext);
    };

    public updateWidgetAlert = async (updatedAlert: IWidgetAlert): Promise<IWidgetAlert> => {
        const savedFilterContext = await this.createOrUpdateWidgetAlertFilterContext(updatedAlert);
        const alertWithSavedFilterContext: IWidgetAlert = {
            ...updatedAlert,
            filterContext: savedFilterContext,
        };

        return this.updateBearWidgetAlert(alertWithSavedFilterContext);
    };

    public deleteWidgetAlert = async (ref: ObjRef): Promise<void> => {
        await this.deleteBearMetadataObject(ref);
    };

    public deleteWidgetAlerts = async (refs: ObjRef[]): Promise<void> => {
        const uris = await Promise.all(refs.map((ref) => objRefToUri(ref, this.workspace, this.authCall)));
        return this.authCall((sdk) => sdk.md.bulkDeleteObjects(this.workspace, uris, "cascade"));
    };

    public getWidgetReferencedObjects = async (
        widget: IWidget,
        types: SupportedWidgetReferenceTypes[] = ["measure"],
    ): Promise<IWidgetReferences> => {
        invariant(
            widgetType(widget) === "kpi",
            "getWidgetReferencedObjects is currently supported for kpi widgets only",
        );

        return new WidgetReferencesQuery(this.authCall, this.workspace, widget, types).run();
    };

    public getResolvedFiltersForWidget = async (widget: IWidget, filters: IFilter[]): Promise<IFilter[]> => {
        return resolveWidgetFilters(filters, widget.ignoreDashboardFilters, widget.dateDataSet, (refs) =>
            objRefsToUris(refs, this.workspace, this.authCall),
        );
    };

    // Alerts
    private createBearWidgetAlert = async (alert: IWidgetAlertDefinition) => {
        const bearAlert = fromSdkModel.convertWidgetAlert(alert);
        const createdBearAlert = await this.authCall((sdk) => sdk.md.createObject(this.workspace, bearAlert));
        const convertedAlertFilterContext = fromSdkModel.convertFilterContext(
            alert.filterContext as IFilterContext, // Filter context is already saved at this point
        );

        return toSdkModel.convertAlert(createdBearAlert, convertedAlertFilterContext) as IWidgetAlert;
    };

    private updateBearWidgetAlert = async (alert: IWidgetAlert): Promise<IWidgetAlert> => {
        const bearAlert = fromSdkModel.convertWidgetAlert(alert);
        await this.updateBearMetadataObject(alert.ref, bearAlert);
        return alert;
    };

    private createOrUpdateWidgetAlertFilterContext = async (
        alert: IWidgetAlertDefinition,
    ): Promise<IFilterContext> => {
        const { filterContext } = alert;
        const emptyFilterContextDefinition: IFilterContextDefinition = {
            title: `Filter context for ${objRefToString(alert.widget)}`,
            description: "",
            filters: [],
        };

        return isFilterContext(filterContext)
            ? this.updateBearFilterContext(filterContext)
            : // Create a new filter context, or create implicit filter context, when not provided
              this.createBearFilterContext(filterContext || emptyFilterContextDefinition);
    };

    private getBearWidgetAlertsForWidget = async (widget: IWidget): Promise<ObjRef[]> => {
        const objectLinks = await this.authCall((sdk) =>
            sdk.md.getObjectUsedBy(this.workspace, widget.uri, {
                types: ["kpiAlert"],
                // limit ourselves to nearest only, otherwise, other alerts on the dashboard would be deleted, too
                nearest: true,
            }),
        );

        return objectLinks.map((link) => uriRef(link.link));
    };

    // Dashboards

    private getBearDashboard = async (
        dashboardRef: ObjRef,
    ): Promise<GdcDashboard.IWrappedAnalyticalDashboard> => {
        const uri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        return this.authCall((sdk) => sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(uri));
    };

    private createBearDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        const createdBearDashboard = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, bearDashboard),
        );
        const createdDashboardDependencies = await this.getBearDashboardDependencies(
            uriRef(createdBearDashboard.analyticalDashboard.meta.uri!),
        );
        return toSdkModel.convertDashboard(createdBearDashboard, createdDashboardDependencies);
    };

    private updateBearDashboard = async (dashboard: IDashboard): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        await this.updateBearMetadataObject(dashboard.ref, bearDashboard);
        return dashboard;
    };

    // Layout

    private updateLayoutAndWidgets = async (
        originalLayout: IDashboardLayout | undefined,
        updatedLayout: IDashboardLayout | undefined,
    ): Promise<IDashboardLayout | undefined> => {
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
            ...createdWidgetsWithLayoutPaths.map((widgetWithpath) =>
                this.createBearWidget(widgetWithpath.widget).then((widget) => ({
                    ...widgetWithpath,
                    widget,
                })),
            ),
            ...updatedWidgetsWithLayoutPaths.map((widgetWithpath) =>
                this.updateBearWidget(widgetWithpath.widget as IWidget).then((widget) => ({
                    ...widgetWithpath,
                    widget,
                })),
            ),
        ]);

        // Update relevant parts of the layout with saved widgets
        const layout = createdAndUpdatedWidgetsWithLayoutPaths.reduce((acc, widgetWithPath) => {
            const updated = set(acc, widgetWithPath.path, widgetWithPath.widget);
            return updated;
        }, clone(updatedLayout));

        return layout;
    };

    // Filter context

    private updateFilterContext = async (
        originalFilterContext: IFilterContext | ITempFilterContext | undefined,
        updatedFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
    ): Promise<IFilterContext | undefined> => {
        if (isTempFilterContext(originalFilterContext)) {
            throw new UnexpectedError("Cannot update temp filter context!");
        } else if (isFilterContextDefinition(updatedFilterContext)) {
            // Create a new filter context
            return this.createBearFilterContext(updatedFilterContext);
        } else if (isFilterContext(updatedFilterContext)) {
            // Update the current filter context
            const shouldUpdateFilterContext = !isEqual(originalFilterContext, updatedFilterContext);
            if (shouldUpdateFilterContext) {
                return this.updateBearFilterContext(updatedFilterContext);
            }
        }

        // No change, return the original filter context
        return originalFilterContext;
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

        const exportFilterContext = await this.authCall(async (sdk) => {
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
                    // Export filter context has expired
                    result = undefined;
                }

                // let other errors propagate correctly
                throw err;
            }

            return result;
        });

        return exportFilterContext;
    };

    private createBearFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const bearFilterContext = fromSdkModel.convertFilterContext(filterContext);
        const savedBearFilterContext = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, bearFilterContext),
        );
        const savedFilterContext = toSdkModel.convertFilterContext(savedBearFilterContext);
        return savedFilterContext as IFilterContext;
    };

    private updateBearFilterContext = async (filterContext: IFilterContext): Promise<IFilterContext> => {
        const bearFilterContext = fromSdkModel.convertFilterContext(filterContext);
        await this.updateBearMetadataObject(filterContext.ref, bearFilterContext);
        return filterContext;
    };

    // Widgets

    private createBearWidget = async (widget: IWidgetDefinition): Promise<IWidget> => {
        const bearWidget = fromSdkModel.convertWidget(widget);
        const savedBearWidget = await this.authCall((sdk) => sdk.md.createObject(this.workspace, bearWidget));
        const savedWidget = toSdkModel.convertWidget(savedBearWidget);
        return savedWidget;
    };

    private updateBearWidget = async (widget: IWidget): Promise<IWidget> => {
        const bearWidget = fromSdkModel.convertWidget(widget);
        await this.updateBearMetadataObject(widget.ref, bearWidget);
        return widget;
    };

    private deleteBearWidgets = async (widgets: IWidget[]): Promise<void> => {
        await Promise.all(widgets.map((widget) => this.deleteBearMetadataObject(widget.ref)));
    };

    private collectCreatedWidgetsWithLayoutPaths = (
        updatedLayout: IDashboardLayout | undefined,
    ): IWidgetWithLayoutPath[] => {
        const widgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        const createdWidgets: IWidgetWithLayoutPath[] = widgetsWithPath.filter(({ widget }) =>
            isWidgetDefinition(widget),
        );

        return createdWidgets;
    };

    private collectUpdatedWidgetsWithLayoutPaths = (
        originalLayout: IDashboardLayout | undefined,
        updatedLayout: IDashboardLayout | undefined,
    ) => {
        const originalLayoutWidgetsWithPath = originalLayout ? layoutWidgetsWithPaths(originalLayout) : [];

        const updatedLayoutWidgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        const updatedWidgetsWithPath = updatedLayoutWidgetsWithPath.filter(({ widget }) => {
            return (
                isWidget(widget) &&
                originalLayoutWidgetsWithPath.some(
                    (w) =>
                        isWidget(w.widget) &&
                        areObjRefsEqual(widget.ref, w.widget.ref) &&
                        !isEqual(widget, w.widget),
                )
            );
        }) as IWidgetWithLayoutPath[];

        return updatedWidgetsWithPath;
    };

    private collectDeletedWidgets = (
        originalLayout: IDashboardLayout | undefined,
        updatedLayout: IDashboardLayout | undefined,
    ): IWidget[] => {
        const originalLayoutWidgets = originalLayout ? layoutWidgets(originalLayout) : [];
        const updatedLayoutWidgets = updatedLayout ? layoutWidgets(updatedLayout) : [];
        const deletedWidgets = originalLayoutWidgets.filter((widget) => {
            return (
                isWidget(widget) &&
                updatedLayoutWidgets.every((w) => isWidget(w) && !areObjRefsEqual(widget.ref, w.ref))
            );
        });

        return deletedWidgets as IWidget[];
    };

    // Alerts
    private getAllBearKpiAlertsForCurrentUser = async (): Promise<GdcMetadata.IWrappedKpiAlert[]> => {
        return this.authCall(async (sdk, context) => {
            const author = await userUriFromAuthenticatedPrincipalWithAnonymous(context.getPrincipal);
            if (!author) {
                return [];
            }
            return sdk.md.getObjectsByQuery<GdcMetadata.IWrappedKpiAlert>(this.workspace, {
                category: "kpiAlert",
                author,
            });
        });
    };

    private getDashboardBearKpiAlertsForCurrentUser = async (
        dashboardRef: ObjRef,
    ): Promise<GdcMetadata.IWrappedKpiAlert[]> => {
        const allAlerts = await this.getAllBearKpiAlertsForCurrentUser();
        if (allAlerts.length === 0) {
            return [];
        }

        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        return allAlerts.filter((alert) => alert.kpiAlert.content.dashboard === dashboardUri);
    };

    private getConvertedAlerts = async (alerts: GdcMetadata.IWrappedKpiAlert[]): Promise<IWidgetAlert[]> => {
        const filterContexts = await this.getBearKpiAlertsFilterContexts(alerts);
        const filterContextByUri = keyBy(
            filterContexts,
            (filterContext) => filterContext.filterContext.meta.uri!,
        );
        const convertedAlerts = alerts.map((alert) => {
            const alertFilterContext = filterContextByUri[alert.kpiAlert.content.filterContext!];
            return toSdkModel.convertAlert(alert, alertFilterContext) as IWidgetAlert;
        });

        return convertedAlerts;
    };

    private getBearKpiAlertsFilterContexts = async (
        kpiAlerts: GdcMetadata.IWrappedKpiAlert[],
    ): Promise<GdcFilterContext.IWrappedFilterContext[]> => {
        const filterContextUris = kpiAlerts
            .map((alert) => alert.kpiAlert.content.filterContext)
            .filter((a): a is string => !!a);
        return this.authCall((sdk) =>
            sdk.md.getObjects<GdcFilterContext.IWrappedFilterContext>(this.workspace, filterContextUris),
        );
    };

    // Metadata

    private updateBearMetadataObject = async (
        ref: ObjRef,
        bearMetadataObject: GdcMetadataObject.WrappedObject,
    ) => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const metadataObjectId = getObjectIdFromUri(uri);
        await this.authCall((sdk) =>
            sdk.md.updateObject(this.workspace, metadataObjectId, bearMetadataObject),
        );
    };

    private deleteBearMetadataObject = async (ref: ObjRef) => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        return this.authCall((sdk) => sdk.md.deleteObject(uri) as Promise<never>);
    };

    private getBearVisualizationClasses = async (): Promise<
        GdcVisualizationClass.IVisualizationClassWrapped[]
    > => {
        return this.authCall((sdk) =>
            sdk.md.getObjectsByQuery<GdcVisualizationClass.IVisualizationClassWrapped>(this.workspace, {
                category: "visualizationClass",
            }),
        );
    };

    private getBearDashboardDependencies = async (
        dashboardRef: ObjRef,
    ): Promise<toSdkModel.BearDashboardDependency[]> => {
        const uri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const dependenciesObjectLinks = await this.authCall((sdk) =>
            sdk.md.getObjectUsing(this.workspace, uri, {
                types: DASHBOARD_DEPENDENCIES_TYPES,
                nearest: false,
            }),
        );
        const dependenciesUris = dependenciesObjectLinks.map((objectLink) => objectLink.link);
        const dependenciesMetadataObjects = await this.authCall((sdk) =>
            sdk.md.getObjects<toSdkModel.BearDashboardDependency>(this.workspace, dependenciesUris),
        );

        return dependenciesMetadataObjects;
    };
}
