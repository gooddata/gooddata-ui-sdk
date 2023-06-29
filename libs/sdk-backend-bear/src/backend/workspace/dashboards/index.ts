// (C) 2019-2023 GoodData Corporation
import {
    IWorkspaceDashboardsService,
    layoutWidgetsWithPaths,
    IWidgetWithLayoutPath,
    layoutWidgets,
    UnexpectedError,
    IWidgetAlertCount,
    SupportedWidgetReferenceTypes,
    IWidgetReferences,
    IDashboardWithReferences,
    IGetDashboardOptions,
    SupportedDashboardReferenceTypes,
    IDashboardReferences,
    IGetScheduledMailOptions,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    IFilter,
    IInsight,
    IUser,
    ObjRef,
    objRefToString,
    uriRef,
    FilterContextItem,
    IFilterContext,
    IFilterContextDefinition,
    ITempFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    IWidgetAlert,
    IWidgetAlertDefinition,
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    widgetType,
    IScheduledMail,
    IScheduledMailDefinition,
    IDashboardLayout,
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    IDashboardPermissions,
} from "@gooddata/sdk-model";
import {
    GdcDashboard,
    GdcDashboardPlugin,
    GdcFilterContext,
    GdcMetadata,
    GdcMetadataObject,
    GdcScheduledMail,
    GdcVisualizationClass,
    GdcVisualizationObject,
} from "@gooddata/api-model-bear";
import { convertVisualization } from "../../../convertors/fromBackend/VisualizationConverter.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import * as fromSdkModel from "../../../convertors/toBackend/DashboardConverter.js";
import * as toSdkModel from "../../../convertors/fromBackend/DashboardConverter/index.js";
import clone from "lodash/clone.js";
import compact from "lodash/compact.js";
import flatMap from "lodash/flatMap.js";
import flatten from "lodash/flatten.js";
import isEqual from "lodash/isEqual.js";
import set from "lodash/set.js";
import {
    getObjectIdFromUri,
    objRefsToUris,
    objRefToUri,
    updateUserMap,
    userUriFromAuthenticatedPrincipalWithAnonymous,
} from "../../../utils/api.js";
import keyBy from "lodash/keyBy.js";
import { BearWorkspaceInsights } from "../insights/index.js";
import { WidgetReferencesQuery } from "./widgetReferences.js";
import { invariant } from "ts-invariant";
import { resolveWidgetFilters } from "./widgetFilters.js";
import { sanitizeFilterContext } from "./filterContexts.js";
import { getAnalyticalDashboardUserUris } from "../../../utils/metadata.js";
import isEmpty from "lodash/isEmpty.js";
import includes from "lodash/includes.js";
import isVisualization = GdcVisualizationObject.isVisualization;
import isDashboardPlugin = GdcDashboardPlugin.isDashboardPlugin;
import remove from "lodash/remove.js";
import { convertUser } from "../../../convertors/fromBackend/UsersConverter.js";
import { BearWorkspacePermissionsFactory } from "../permissions/permissions.js";

/**
 * Metadata object types closely related to the dashboard object.
 */
type RelatedObjectTypes = Extract<
    GdcMetadata.ObjectCategory,
    "kpi" | "visualizationWidget" | "visualizationObject" | "filterContext" | "dashboardPlugin"
>;

/**
 * Lists types of those metadata object that are essentially components of the dashboard object. Every time
 * when dashboard is loaded all related objects of these types must be loaded as well as their
 * content is integral part of the dashboard itself.
 */
const DashboardComponentTypes: RelatedObjectTypes[] = ["kpi", "visualizationWidget", "filterContext"];

// TODO: refactor impl into bunch of smaller classes + delegates
export class BearWorkspaceDashboards implements IWorkspaceDashboardsService {
    private insights: BearWorkspaceInsights;
    private permissions: BearWorkspacePermissionsFactory;

    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {
        this.insights = new BearWorkspaceInsights(this.authCall, this.workspace);
        this.permissions = new BearWorkspacePermissionsFactory(this.authCall, this.workspace);
    }

    // Public methods

    public getDashboards = async (options: IGetDashboardOptions = {}): Promise<IListedDashboard[]> => {
        const explicitlySharedDashboardsObjectLinks = await this.authCall((sdk) =>
            sdk.md.getAnalyticalDashboards(this.workspace),
        );

        const accessibleDashboardsObjectLinks = await this.getAccessibleDashboards(
            explicitlySharedDashboardsObjectLinks,
            !!options.includeAvailableViaLink,
        );

        const userMap: Map<string, IUser> = options.loadUserData
            ? await updateUserMap(
                  new Map(),
                  compact(
                      flatMap(accessibleDashboardsObjectLinks, (link) => [link.author, link.contributor]),
                  ),
                  this.authCall,
              )
            : new Map();

        return accessibleDashboardsObjectLinks.map((link) => {
            const availability = this.isExplicitlyShared(link, explicitlySharedDashboardsObjectLinks)
                ? "full"
                : "viaLink";
            return toSdkModel.convertListedDashboard(link, availability, userMap);
        });
    };

    public getDashboard = async (
        dashboardRef: ObjRef,
        exportFilterContextRef?: ObjRef,
        options: IGetDashboardOptions = {},
    ): Promise<IDashboard> => {
        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const exportFilterContextUri = exportFilterContextRef
            ? await objRefToUri(exportFilterContextRef, this.workspace, this.authCall)
            : undefined;

        const bearDashboard = await this.getBearDashboard(dashboardUri);
        const dependenciesToGet = [...DashboardComponentTypes];
        const bearVisualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[] = [];

        if (!bearDashboard.analyticalDashboard.content.layout) {
            // when dashboard has no layout and only list of widgets, the conversion will build an
            // implicit layout. in order to set sizes correctly in that layout, the code needs to have
            // visualization objects & info about visualization classes
            dependenciesToGet.push("visualizationObject");
            bearVisualizationClasses.push(...(await this.getBearVisualizationClasses()));
        }

        const [bearDependencies, bearExportFilterContext] = await Promise.all([
            this.getBearDashboardDependencies(dashboardUri, dependenciesToGet),
            this.getBearExportFilterContext(exportFilterContextRef),
        ] as const);

        if (bearExportFilterContext) {
            bearDashboard.analyticalDashboard.content.filterContext = exportFilterContextUri;
            bearDependencies.push(bearExportFilterContext);
        }

        const userMap: Map<string, IUser> = options.loadUserData
            ? await updateUserMap(new Map(), getAnalyticalDashboardUserUris(bearDashboard), this.authCall)
            : new Map();

        return toSdkModel.convertDashboard(
            bearDashboard,
            bearDependencies,
            bearVisualizationClasses,
            exportFilterContextUri,
            userMap,
        );
    };

    public createDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const emptyDashboard: IDashboardDefinition = {
            type: "IDashboard",
            description: "",
            filterContext: undefined,
            title: "",
            shareStatus: "private",
            isUnderStrictControl: false,
        };

        return this.updateDashboard(emptyDashboard as IDashboard, dashboard);
    };

    public updateDashboard = async (
        originalDashboard: IDashboard,
        updatedDashboard: IDashboard | IDashboardDefinition,
    ): Promise<IDashboard> => {
        if (!areObjRefsEqual(originalDashboard.ref, updatedDashboard.ref)) {
            throw new Error("Cannot update dashboard with different refs!");
        }

        if (isEqual(originalDashboard, updatedDashboard)) {
            return originalDashboard;
        }

        // for convenience allow clients to pass plugin links also with idRefs
        const sanitizedPlugins = updatedDashboard.plugins
            ? await this.ensureDashboardPluginLinksHaveUris(updatedDashboard.plugins)
            : undefined;
        const sanitizedDashboard: IDashboard | IDashboardDefinition = {
            ...updatedDashboard,
            plugins: sanitizedPlugins,
        };

        const [filterContext, layout] = await Promise.all([
            this.updateFilterContext(originalDashboard.filterContext, sanitizedDashboard.filterContext),
            this.updateLayoutAndWidgets(originalDashboard.layout, sanitizedDashboard.layout),
        ]);

        // Missing refs means that the dashboard is not yet stored, so let's create it
        if (!originalDashboard.ref && !sanitizedDashboard.ref) {
            const createdDashboardWithSavedDependencies: IDashboardDefinition = {
                ...sanitizedDashboard,
                filterContext,
                layout,
            };

            return this.createBearDashboard(createdDashboardWithSavedDependencies);
        }

        const { created, updated, ref, uri, identifier } = originalDashboard;
        const updatedDashboardWithSavedDependencies: IDashboard = {
            ...sanitizedDashboard,
            created, // update returns only the uri, so keep the old date
            updated, // update returns only the uri, so keep the old date
            ref,
            uri,
            identifier,
            filterContext,
            layout,
        };

        // First we need to delete any alerts referenced by the deleted widgets
        const deletedWidgets = this.collectDeletedWidgets(
            originalDashboard.layout,
            sanitizedDashboard.layout,
        );

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
        const convertedFilters = filters?.map(fromSdkModel.convertFilterContextItem);
        return this.authCall((sdk) =>
            sdk.dashboard.exportToPdf(this.workspace, dashboardUri, convertedFilters).then((res) => res.uri),
        );
    };

    public exportDashboardToPdfBlob = async (
        dashboardRef: ObjRef,
        filters?: FilterContextItem[],
    ): Promise<IExportBlobResult> => {
        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        const convertedFilters = filters?.map(fromSdkModel.convertFilterContextItem);
        return this.authCall((sdk) =>
            sdk.dashboard.exportToPdfBlob(this.workspace, dashboardUri, convertedFilters).then((res) => res),
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

    public updateScheduledMail = async (
        ref: ObjRef,
        scheduledMailDefinition: IScheduledMailDefinition,
        filterContextRef?: ObjRef,
    ): Promise<void> => {
        const scheduledMailWithFilterContext = {
            ...scheduledMailDefinition,
            attachments: scheduledMailDefinition.attachments.map((attachment) => ({
                ...attachment,
                filterContext: filterContextRef,
            })),
        };

        const convertedScheduledMail = fromSdkModel.convertScheduledMail(scheduledMailWithFilterContext);

        await this.updateBearMetadataObject(ref, convertedScheduledMail);
    };

    public deleteScheduledMail = async (scheduledMailRef: ObjRef): Promise<void> => {
        await this.deleteBearMetadataObject(scheduledMailRef);
    };

    public getScheduledMailsForDashboard = async (
        dashboardRef: ObjRef,
        options: IGetScheduledMailOptions = {},
    ): Promise<IScheduledMail[]> => {
        const { createdByCurrentUser } = options;
        const scheduledMailObjectLinks = createdByCurrentUser
            ? await this.getScheduledMailObjectLinksForDashboardAndCurrentUser(dashboardRef)
            : await this.getScheduledMailObjectLinksForDashboard(dashboardRef);

        let userMap: Map<string, IUser> = new Map();
        if (options.loadUserData) {
            userMap = await updateUserMap(
                userMap,
                compact(flatMap(scheduledMailObjectLinks, (link) => [link.author, link.contributor])),
                this.authCall,
            );

            // if listing users is not allowed add at least the current user
            if (userMap.values.length === 0) {
                await this.authCall(async (sdk) => {
                    const profile = await sdk.user.getCurrentProfile();
                    const user = convertUser(profile);
                    if (profile.links?.self) {
                        userMap.set(profile.links?.self, user);
                    }
                });
            }
        }

        const wrappedScheduledMails = await this.authCall(async (sdk) => {
            return sdk.md.getObjects<GdcScheduledMail.IWrappedScheduledMail>(
                this.workspace,
                scheduledMailObjectLinks.map(({ link }) => link),
            );
        });

        return wrappedScheduledMails.map((scheduledMail) =>
            toSdkModel.convertScheduledMail(scheduledMail, userMap),
        ) as IScheduledMail[];
    };

    public getScheduledMailsCountForDashboard = async (dashboardRef: ObjRef): Promise<number> => {
        const objectLinks = await this.getScheduledMailObjectLinksForDashboard(dashboardRef);

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
        return result.map((entry): IWidgetAlertCount => {
            return {
                ref: uriRef(entry.uri),
                alertCount: entry.entries.length,
            };
        });
    };

    public createWidgetAlert = async (alert: IWidgetAlertDefinition): Promise<IWidgetAlert> => {
        const [savedFilterContext, dashboardUri] = await Promise.all([
            this.createOrUpdateWidgetAlertFilterContext(alert),
            objRefToUri(alert.dashboard, this.workspace, this.authCall),
        ]);
        const alertWithSavedFilterContext: IWidgetAlertDefinition = {
            ...alert,
            dashboard: uriRef(dashboardUri), // bear only supports uri refs here, so we need to make sure it gets uri
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
        // make sure the alert has a non-empty title, otherwise the backend will throw
        // the default is taken form the existing convention set by KPI Dashboards
        const alertWithSanitizedName: IWidgetAlertDefinition = {
            ...alert,
            title: alert.title || "kpi alert", // must be a non empty string, hence the || and not ??
        };
        const bearAlert = fromSdkModel.convertWidgetAlert(alertWithSanitizedName);
        const createdBearAlert = await this.authCall((sdk) => sdk.md.createObject(this.workspace, bearAlert));
        const convertedAlertFilterContext = fromSdkModel.convertFilterContext(
            alertWithSanitizedName.filterContext as IFilterContext, // Filter context is already saved at this point
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

    private getBearDashboard = async (uri: string): Promise<GdcDashboard.IWrappedAnalyticalDashboard> => {
        return this.authCall((sdk) => sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(uri));
    };

    private createBearDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        const createdBearDashboard = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, bearDashboard),
        );
        const createdDashboardDependencies = await this.getBearDashboardDependencies(
            createdBearDashboard.analyticalDashboard.meta.uri!,
            DashboardComponentTypes,
        );
        return toSdkModel.convertDashboard(createdBearDashboard, createdDashboardDependencies);
    };

    private updateBearDashboard = async (dashboard: IDashboard): Promise<IDashboard> => {
        const bearDashboard = fromSdkModel.convertDashboard(dashboard);
        await this.updateBearMetadataObject(dashboard.ref, bearDashboard);
        return dashboard;
    };

    private getAccessibleDashboards = async (
        explicitlySharedDashboardsObjectLinks: GdcMetadata.IObjectLink[],
        includeAvailableViaLink: boolean,
    ) => {
        if (!includeAvailableViaLink) {
            return explicitlySharedDashboardsObjectLinks;
        }
        const allDashboardsObjectLinks = await this.authCall((sdk) =>
            sdk.md.getAnalyticalDashboards(this.workspace, true),
        );

        return allDashboardsObjectLinks.filter((dashboard) => {
            return (
                this.isExplicitlyShared(dashboard, explicitlySharedDashboardsObjectLinks) ||
                !dashboard?.flags?.includes("strictAccessControl")
            );
        });
    };

    private isExplicitlyShared(
        dashboard: GdcMetadata.IObjectLink,
        explicitlySharedDashboards: GdcMetadata.IObjectLink[],
    ) {
        return explicitlySharedDashboards.some(({ link }) => link === dashboard.link);
    }

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
        return createdAndUpdatedWidgetsWithLayoutPaths.reduce((acc, widgetWithPath) => {
            return set(acc, widgetWithPath.path, widgetWithPath.widget);
        }, clone(updatedLayout));
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

        return this.authCall(async (sdk) => {
            let result:
                | GdcFilterContext.IWrappedFilterContext
                | GdcFilterContext.IWrappedTempFilterContext
                | undefined;

            try {
                result = await sdk.md.getObjectDetails<
                    GdcFilterContext.IWrappedFilterContext | GdcFilterContext.IWrappedTempFilterContext
                >(exportFilterContextUri);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    // Export filter context has expired
                    result = undefined;
                }

                // let other errors propagate correctly
                throw err;
            }

            return result;
        });
    };

    private createBearFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const sanitizedFilterContext = await this.sanitizeFilterContext(filterContext);
        const bearFilterContext = fromSdkModel.convertFilterContext(sanitizedFilterContext);
        const savedBearFilterContext = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, bearFilterContext),
        );
        const savedFilterContext = toSdkModel.convertFilterContext(savedBearFilterContext);
        return savedFilterContext as IFilterContext;
    };

    private updateBearFilterContext = async (filterContext: IFilterContext): Promise<IFilterContext> => {
        const sanitizedFilterContext = await this.sanitizeFilterContext(filterContext);
        const bearFilterContext = fromSdkModel.convertFilterContext(sanitizedFilterContext);
        await this.updateBearMetadataObject(filterContext.ref, bearFilterContext);
        return filterContext;
    };

    private sanitizeFilterContext = <T extends IFilterContextDefinition>(filterContext: T): Promise<T> => {
        return sanitizeFilterContext(filterContext, (refs) =>
            objRefsToUris(refs, this.workspace, this.authCall),
        );
    };

    // Widgets

    private createBearWidget = async (widget: IWidgetDefinition): Promise<IWidget> => {
        const bearWidget = fromSdkModel.convertWidget(widget);
        const savedBearWidget = await this.authCall((sdk) => sdk.md.createObject(this.workspace, bearWidget));
        return toSdkModel.convertWidget(savedBearWidget);
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
    ): IWidgetWithLayoutPath<IWidgetDefinition>[] => {
        const widgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        return widgetsWithPath.filter(
            (widgetWithPath): widgetWithPath is IWidgetWithLayoutPath<IWidgetDefinition> =>
                isWidgetDefinition(widgetWithPath.widget),
        );
    };

    private collectUpdatedWidgetsWithLayoutPaths = (
        originalLayout: IDashboardLayout | undefined,
        updatedLayout: IDashboardLayout | undefined,
    ) => {
        const originalLayoutWidgetsWithPath = originalLayout ? layoutWidgetsWithPaths(originalLayout) : [];

        const updatedLayoutWidgetsWithPath = updatedLayout ? layoutWidgetsWithPaths(updatedLayout) : [];

        return updatedLayoutWidgetsWithPath.filter(({ widget }) => {
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
        return alerts.map((alert) => {
            const alertFilterContext = filterContextByUri[alert.kpiAlert.content.filterContext!];
            return toSdkModel.convertAlert(alert, alertFilterContext) as IWidgetAlert;
        });
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

    // Scheduled mail

    private getScheduledMailObjectLinksForDashboard = async (
        dashboardRef: ObjRef,
    ): Promise<GdcMetadata.IObjectLink[]> => {
        const dashboardUri = await objRefToUri(dashboardRef, this.workspace, this.authCall);
        return this.authCall((sdk) =>
            sdk.md.getObjectUsedBy(this.workspace, dashboardUri, {
                nearest: true,
                types: ["scheduledMail"],
            }),
        );
    };

    private getScheduledMailObjectLinksForDashboardAndCurrentUser = async (
        dashboardRef: ObjRef,
    ): Promise<GdcMetadata.IObjectLink[]> => {
        return this.authCall(async (_sdk, context) => {
            const user = await userUriFromAuthenticatedPrincipalWithAnonymous(context.getPrincipal);
            if (!user) {
                return [];
            }

            const objectLinks = await this.getScheduledMailObjectLinksForDashboard(dashboardRef);

            return objectLinks.filter(({ author }) => author === user);
        });
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
        uri: string,
        types: RelatedObjectTypes[],
    ): Promise<toSdkModel.BearDashboardDependency[]> => {
        const dependenciesObjectLinks = await this.authCall((sdk) =>
            sdk.md.getObjectUsing(this.workspace, uri, {
                types,
                nearest: false,
            }),
        );

        const dependenciesUris = dependenciesObjectLinks.map((objectLink) => objectLink.link);

        return this.authCall((sdk) =>
            sdk.md.getObjects<toSdkModel.BearDashboardDependency>(this.workspace, dependenciesUris),
        );
    };

    private getBearDashboardReferences = async (
        uri: string,
        types: SupportedDashboardReferenceTypes[],
    ): Promise<{
        dependencies: toSdkModel.BearDashboardDependency[];
        visClassMapping: Record<string, string>;
    }> => {
        const objectTypes = compact(types.map(mapDashboardReferenceTypes));

        if (isEmpty(objectTypes)) {
            return {
                dependencies: [],
                visClassMapping: {},
            };
        }

        if (includes(types, "insight")) {
            return Promise.all([
                this.getBearDashboardDependencies(uri, objectTypes),
                this.insights.getVisualizationClassesByVisualizationClassUri({ includeDeprecated: true }),
            ]).then(([dependencies, visClassMapping]) => {
                return {
                    dependencies,
                    visClassMapping,
                };
            });
        }

        return this.getBearDashboardDependencies(uri, objectTypes).then((dependencies) => {
            return {
                dependencies,
                visClassMapping: {},
            };
        });
    };

    public async getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options: IGetDashboardOptions = {},
        types: SupportedDashboardReferenceTypes[] = ["insight"],
    ): Promise<IDashboardWithReferences> {
        const dashboard = await this.getDashboard(ref, filterContextRef, options);
        const references = await this.getDashboardReferencedObjects(dashboard, types);

        return {
            dashboard,
            references,
        };
    }

    public getDashboardReferencedObjects = async (
        dashboard: IDashboard,
        types: SupportedDashboardReferenceTypes[] = ["insight", "dashboardPlugin"],
    ): Promise<IDashboardReferences> => {
        const typesToGet = [...types];

        // if there are no plugins linked to the dashboard then do not ask for related plugin info
        if (isEmpty(dashboard.plugins)) {
            remove(typesToGet, (item) => item === "dashboardPlugin");
        }

        // bail out if there is nothing to get (e.g. user asked for referenced plugins but the dashboard has none)
        if (isEmpty(typesToGet)) {
            return {
                plugins: [],
                insights: [],
            };
        }

        const { dependencies, visClassMapping } = await this.getBearDashboardReferences(
            dashboard.uri,
            typesToGet,
        );
        const insights: IInsight[] = [];
        const plugins: IDashboardPlugin[] = [];

        dependencies.forEach((dep) => {
            if (isVisualization(dep)) {
                insights.push(
                    convertVisualization(
                        dep,
                        visClassMapping[dep.visualizationObject.content.visualizationClass.uri],
                    ),
                );
            } else if (isDashboardPlugin(dep)) {
                plugins.push(toSdkModel.convertDashboardPlugin(dep));
            }
        });

        return {
            insights,
            plugins,
        };
    };

    public createDashboardPlugin = async (plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> => {
        const convertedPlugin = fromSdkModel.convertDashboardPlugin(plugin);
        const savedPlugin = await this.authCall((sdk) => {
            return sdk.md.createObject(this.workspace, convertedPlugin);
        });

        if (plugin.identifier !== undefined) {
            // when server creates a new object, it will automatically assign identifier & ignore identifier
            // in the POST payload. Code must do another update to hammer in the desired identifier.
            const pluginObjectId = getObjectIdFromUri(savedPlugin.dashboardPlugin.meta.uri!);
            savedPlugin.dashboardPlugin.meta.identifier = plugin.identifier;

            await this.authCall((sdk) => {
                return sdk.md.updateObject(this.workspace, pluginObjectId, savedPlugin);
            });
        }

        return toSdkModel.convertDashboardPlugin(savedPlugin);
    };

    public deleteDashboardPlugin = async (ref: ObjRef): Promise<void> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);

        return this.authCall((sdk) => {
            return sdk.md.deleteObject(uri) as Promise<never>;
        });
    };

    public getDashboardPlugin = async (ref: ObjRef): Promise<IDashboardPlugin> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);

        return this.authCall((sdk) => {
            return sdk.md.getObjectDetails<GdcDashboardPlugin.IWrappedDashboardPlugin>(uri);
        }).then(toSdkModel.convertDashboardPlugin);
    };

    public getDashboardPlugins = async (): Promise<IDashboardPlugin[]> => {
        const pluginLinks = await this.authCall((sdk) => sdk.md.getDashboardPlugins(this.workspace));
        const pluginUris = pluginLinks.map((link) => link.link);

        return this.authCall((sdk) => {
            return sdk.md.getObjects<GdcDashboardPlugin.IWrappedDashboardPlugin>(this.workspace, pluginUris);
        }).then((plugins) => {
            return plugins.map(toSdkModel.convertDashboardPlugin);
        });
    };

    /**
     * Get user's dashboard-level permissions
     *
     * @remarks
     * On bear the dashboard permissions are derived from dashboard accessibility
     * and user's workspace-level permissions
     *
     * @param ref - dashboard reference
     */
    public getDashboardPermissions = async (ref: ObjRef): Promise<IDashboardPermissions> => {
        try {
            const uri = await objRefToUri(ref, this.workspace, this.authCall);
            await this.authCall((sdk) =>
                sdk.md.getObjectDetails<GdcDashboard.IWrappedAnalyticalDashboard>(uri),
            );

            const workspacePermissions = await this.authCall(() =>
                this.permissions.getPermissionsForCurrentUser(),
            );

            const canEditDashboard = workspacePermissions.canManageAnalyticalDashboard;
            const canShareDashboard = workspacePermissions.canManageACL;
            const canManageLockedDashboard = canEditDashboard && workspacePermissions.canManageProject;
            return {
                canEditDashboard,
                canEditLockedDashboard: canManageLockedDashboard,
                canShareDashboard,
                canShareLockedDashboard: canManageLockedDashboard,
                canViewDashboard: true,
            };
        } catch (_e) {
            return {
                canEditDashboard: false,
                canEditLockedDashboard: false,
                canShareDashboard: false,
                canShareLockedDashboard: false,
                canViewDashboard: false,
            };
        }
    };

    private ensureDashboardPluginLinksHaveUris = async (
        pluginLinks: IDashboardPluginLink[],
    ): Promise<IDashboardPluginLink[]> => {
        const resolvedUris = await objRefsToUris(
            pluginLinks.map((p) => p.plugin),
            this.workspace,
            this.authCall,
            true,
        );

        return pluginLinks.map((p, idx) => {
            return {
                ...p,
                plugin: uriRef(resolvedUris[idx]),
            };
        });
    };

    public validateDashboardsExistence = async (dashboardRefs: ObjRef[]) => {
        const validDashboards = await Promise.all(
            dashboardRefs.map(async (ref) => {
                try {
                    const { title, identifier, isUnderStrictControl, uri } = await this.getDashboard(ref);
                    // Dashboard is not shared with current user (but does not have strict mode enabled).

                    // For admin, backend returns object without 403 even if it is under strict control, therefore we
                    // need to remove title of the dashboard to simulate forbidden dashboard without title to have
                    // consistent behavior for both editor and admin.
                    return {
                        ref,
                        title: isUnderStrictControl ? undefined : title,
                        identifier,
                        uri,
                    };
                } catch (error: any) {
                    if (error.httpStatus === 403) {
                        // forbidden
                        return {
                            ref,
                            identifier: objRefToString(ref), // target ref contains required dashboard ID,
                            uri: "", // not needed for forbidden dashboard
                        };
                    } else {
                        // non-existent
                        return undefined;
                    }
                }
            }),
        );

        return compact(validDashboards);
    };
}

function mapDashboardReferenceTypes(type: SupportedDashboardReferenceTypes): RelatedObjectTypes | undefined {
    const mapping: { [type in SupportedDashboardReferenceTypes]: RelatedObjectTypes } = {
        insight: "visualizationObject",
        dashboardPlugin: "dashboardPlugin",
    };

    return mapping[type];
}
