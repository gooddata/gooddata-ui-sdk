// (C) 2020 GoodData Corporation
import { MetadataModule } from "./metadata";
import { XhrModule } from "./xhr";
import { UserModule } from "./user";
import cloneDeepWith from "lodash/cloneDeepWith";
import { GdcKpi, GdcDashboard, GdcFilterContext, GdcVisualizationWidget } from "@gooddata/api-model-bear";

/**
 * Modify how and what should be copied to the cloned dashboard
 */

export interface ICopyDashboardOptions {
    /** copy new kpi and reference it in the cloned dashboard */
    copyKpi?: boolean;
    /** copy new visualization object and reference it in the cloned widget */
    copyVisObj?: boolean;
    /** optional, default value of name is "Copy of (current dashboard title)" */
    name?: string;
    /** optional, default value of summary is (current dashboard summary) */
    summary?: string;
}

type UriTranslator = (oldUri: string) => string;

export function createTranslator(
    kpiMap: Map<string, string>,
    visWidgetMap: Map<string, string>,
): UriTranslator {
    return (oldUri: string): string => {
        const kpiMatch = kpiMap.get(oldUri);
        const visWidgetMatch = visWidgetMap.get(oldUri);
        if (kpiMatch) {
            return kpiMatch;
        } else if (visWidgetMatch) {
            return visWidgetMatch;
        } else {
            return oldUri;
        }
    };
}

/**
 * Updates content of the dashboard
 *
 * @param {string} dashboardUri uri of dashboard
 * @param {UriTranslator} uriTranslator gets updated widgets and kpis uri
 * @param {string} filterContext updated filter context uri
 * @experimental
 */
export function updateContent(
    analyticalDashboard: GdcDashboard.IAnalyticalDashboard,
    uriTranslator: UriTranslator,
    filterContext: string,
): GdcDashboard.IAnalyticalDashboardContent {
    return cloneDeepWith(
        {
            ...analyticalDashboard.content,
            filterContext,
            widgets: analyticalDashboard.content.widgets.map((uri: string) => {
                return uriTranslator(uri);
            }),
        },
        (value) => {
            const uri = value.uri;
            if (!uri) {
                return;
            }
            return {
                ...value,
                uri: uriTranslator(uri),
            };
        },
    );
}

export class MetadataModuleExt {
    private metadataModule: MetadataModule;
    private userModule: UserModule;
    private xhr: XhrModule;

    constructor(xhr: XhrModule) {
        this.xhr = xhr;
        this.metadataModule = new MetadataModule(xhr);
        this.userModule = new UserModule(xhr);
    }

    /**
     * @param {string} projectId id of the project
     * @param {string} dashboardUri uri of the dashboard
     * @param {ICopyDashboardOptions} options object with options:
     *          - default {} dashboard is cloned with new kpi reference and visualization widget is cloned with new
     *              visualization object reference
     *          - copyKpi {boolean} choose whether dashboard is cloned with new Kpi reference
     *          - copyVisObj {boolean} choose whether visualization widget is cloned with new visualization object reference
     *          - name {string} optional - choose name, default value is "Copy of (old title of the dashboard)"
     * @returns {string} uri of cloned dashboard
     * @experimental
     */

    public async saveDashboardAs(
        projectId: string,
        dashboardUri: string,
        options: ICopyDashboardOptions,
    ): Promise<string> {
        const objectsFromDashboard = await this.getObjectsFromDashboard(projectId, dashboardUri);
        const dashboardDetails = await this.metadataModule.getObjectDetails(dashboardUri);
        const {
            analyticalDashboard,
        }: { analyticalDashboard: GdcDashboard.IAnalyticalDashboard } = dashboardDetails;
        const allCreatedObjUris: string[] = [];
        const visWidgetUris: string[] = [];
        try {
            const filterContext = await this.duplicateFilterContext(projectId, objectsFromDashboard);
            allCreatedObjUris.push(filterContext);
            const kpiMap = await this.duplicateOrKeepKpis(projectId, objectsFromDashboard, options);
            if (this.shouldCopyKpi(options)) {
                allCreatedObjUris.push(...Array.from(kpiMap.values()));
            }
            const visWidgetMap = await this.duplicateWidgets(projectId, objectsFromDashboard, options);
            visWidgetUris.push(...Array.from(visWidgetMap.values()));
            const translator = createTranslator(kpiMap, visWidgetMap);
            const updatedContent = updateContent(analyticalDashboard, translator, filterContext);
            const dashboardTitle = this.getDashboardName(analyticalDashboard.meta.title, options.name);
            const dashboardSummary = this.getDashboardSummary(
                analyticalDashboard.meta.summary,
                options.summary,
            );

            const duplicateDashboard: GdcDashboard.IWrappedAnalyticalDashboard = {
                analyticalDashboard: {
                    ...dashboardDetails.analyticalDashboard,
                    content: {
                        filterContext,
                        layout: { ...updatedContent.layout },
                        widgets: [...updatedContent.widgets],
                    },
                    meta: {
                        ...dashboardDetails.analyticalDashboard.meta,
                        title: dashboardTitle,
                        summary: dashboardSummary,
                    },
                },
            };

            const duplicateDashboardUri: string = (
                await this.metadataModule.createObject(projectId, duplicateDashboard)
            ).analyticalDashboard.meta.uri!;

            return duplicateDashboardUri;
        } catch (err) {
            if (this.shouldCopyVisObj(options)) {
                await Promise.all(visWidgetUris.map((uri) => this.cascadingDelete(projectId, uri)));
            } else {
                await Promise.all(visWidgetUris.map((uri) => this.metadataModule.deleteObject(uri)));
            }
            await Promise.all(allCreatedObjUris.map((uri) => this.cascadingDelete(projectId, uri)));
            return dashboardUri;
        }
    }

    /**
     * Deletes dashboard and its objects
     * (only the author of the dashboard can delete the dashboard and its objects)
     *
     * @method deleteAllObjects
     * @param {string} projectId Project identifier
     * @param {string} dashboardUri Uri of a dashboard to be deleted
     * @experimental
     */

    public async cascadingDelete(projectID: string, dashboardUri: string): Promise<any> {
        const objects: any[] = await this.metadataModule.getObjectUsing(projectID, dashboardUri);
        const currentUser: string = (await this.userModule.getAccountInfo()).profileUri;

        const objectsToBeDeleted = objects
            .filter((object: any) => object.author === currentUser)
            .map((object: any) => {
                return object.link;
            });

        return this.xhr.post(`/gdc/md/${projectID}/objects/delete`, {
            body: {
                delete: {
                    items: [dashboardUri].concat(objectsToBeDeleted),
                    mode: "cascade",
                },
            },
        });
    }

    private getDashboardName(originalName: string, newName?: string): string {
        if (newName !== undefined) {
            return newName;
        }
        return `Copy of ${originalName}`;
    }

    private getDashboardSummary(originalSummary?: string, newSummary?: string): string {
        if (newSummary !== undefined) {
            return newSummary;
        } else if (originalSummary !== undefined) {
            return originalSummary;
        }
        return "";
    }

    private async duplicateOrKeepKpis(
        projectId: string,
        objsFromDashboard: any[],
        options: ICopyDashboardOptions,
    ): Promise<Map<string, string>> {
        const uriMap: Map<string, string> = new Map();
        if (this.shouldCopyKpi(options)) {
            await Promise.all(
                objsFromDashboard
                    .filter((obj: any) => this.unwrapObj(obj).meta.category === "kpi")
                    .map(async (kpiWidget: any) => {
                        const { kpi }: { kpi: GdcKpi.IKPI } = kpiWidget;
                        const newUriKpiObj: string = (
                            await this.metadataModule.createObject(projectId, kpiWidget)
                        ).kpi.meta.uri;
                        uriMap.set(kpi.meta.uri!, newUriKpiObj);
                    }),
            );
        }

        return uriMap;
    }

    private async duplicateWidgets(
        projectId: string,
        objsFromDashboard: any[],
        options: ICopyDashboardOptions,
    ): Promise<Map<string, string>> {
        const uriMap: Map<string, string> = new Map();

        await Promise.all(
            objsFromDashboard
                .filter((obj: any) => this.unwrapObj(obj).meta.category === "visualizationWidget")
                .map(async (visWidget: any) => {
                    return this.createAndUpdateWidgets(projectId, visWidget, options, uriMap);
                }),
        );

        return uriMap;
    }

    private async createAndUpdateWidgets(
        projectId: string,
        visWidget: any,
        options: ICopyDashboardOptions,
        uriMap: Map<string, string>,
    ): Promise<void> {
        const { visualizationWidget } = visWidget;
        if (this.shouldCopyVisObj(options)) {
            const visObj = await this.metadataModule.getObjectDetails(
                visualizationWidget.content.visualization,
            );
            const newUriVisObj = (await this.metadataModule.createObject(projectId, visObj))
                .visualizationObject.meta.uri;

            const updatedVisWidget = {
                ...visWidget,
                visualizationWidget: {
                    ...visWidget.visualizationWidget,
                    content: {
                        ...visWidget.visualizationWidget.content,
                        visualization: newUriVisObj,
                    },
                },
            };
            const visUri = (await this.metadataModule.createObject(projectId, updatedVisWidget))
                .visualizationWidget.meta.uri;
            uriMap.set(visualizationWidget.meta.uri, visUri);
        } else {
            const { visualizationWidget } = await this.metadataModule.createObject(projectId, visWidget);
            uriMap.set(visWidget.visualizationWidget.meta.uri, visualizationWidget.meta.uri);
        }
    }

    private async duplicateFilterContext(projectId: string, objsFromDashboard: any): Promise<string> {
        const { filterContext } = await this.metadataModule.createObject(
            projectId,
            objsFromDashboard.filter((obj: any) => this.unwrapObj(obj).meta.category === "filterContext")[0],
        );
        return filterContext.meta.uri;
    }

    private async getObjectsFromDashboard(
        projectId: string,
        dashboardUri: string,
    ): Promise<
        Array<GdcKpi.IKPI | GdcFilterContext.IFilterContext | GdcVisualizationWidget.IVisualizationWidget>
    > {
        const uris = await this.getObjectsUrisInDashboard(projectId, dashboardUri);
        return this.metadataModule.getObjects<any>(projectId, uris); // TODO improve types
    }

    private async getObjectsUrisInDashboard(projectId: string, dashboardUri: string): Promise<string[]> {
        return (
            await this.metadataModule.getObjectUsing(projectId, dashboardUri, {
                types: ["kpi", "visualizationWidget", "filterContext"],
            })
        ).map((obj: any) => {
            return obj.link;
        });
    }

    private unwrapObj(obj: any): any {
        return obj[Object.keys(obj)[0]];
    }

    private shouldCopyVisObj(options: ICopyDashboardOptions): boolean {
        return !!(options.copyVisObj || typeof options.copyVisObj === "undefined");
    }

    private shouldCopyKpi(options: ICopyDashboardOptions): boolean {
        return !!(options.copyKpi || typeof options.copyKpi === "undefined");
    }
}
