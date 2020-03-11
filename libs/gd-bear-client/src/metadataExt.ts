// (C) 2020 GoodData Corporation
import { MetadataModule } from "./metadata";
import { XhrModule } from "./xhr";
import { UserModule } from "./user";
import cloneDeepWith from "lodash/cloneDeepWith";
import { GdcKpi, GdcDashboard, GdcDashboardExport, GdcVisualizationWidget } from "@gooddata/gd-bear-model";

/**
 * Modify how and what should be copied to the cloned dashboard
 */

export interface ICopyDashboardOptions {
    /** copy new kpi and reference it in the cloned dashboard */
    copyKpi?: boolean;
    /** copy new insight and reference it in the cloned widget */
    copyInsight?: boolean;
    /** optional, default value of name is "Copy of (current dashboard title)" */
    name?: string;
}

type UriTranslator = (oldUri: string) => string;

export function createTranslator(
    kpiMap: Map<string, string>,
    visWidgetMap: Map<string, string>,
): UriTranslator {
    return (oldUri: string): string => {
        if (kpiMap.get(oldUri) !== undefined) {
            return kpiMap.get(oldUri) as string;
        } else if (visWidgetMap.get(oldUri) !== undefined) {
            return visWidgetMap.get(oldUri) as string;
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
    analyticalDashboard: any,
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
        key => {
            const uri = key.uri;
            if (uri === undefined) {
                return;
            }
            return {
                ...key,
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
     *              Insight reference
     *          - copyKpi {boolean} choose whether dashboard is cloned with new Kpi reference
     *          - copyInsight {boolean} choose whether visualization widget is cloned with new Insight reference
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
            const kpiMap = await this.duplicateOrKeepKpis(projectId, objectsFromDashboard, options);
            if (options.copyKpi || typeof options.copyKpi === "undefined") {
                allCreatedObjUris.push(filterContext, ...Array.from(kpiMap.values()));
            } else {
                allCreatedObjUris.push(filterContext);
            }
            const visWidgetMap = await this.duplicateWidgets(projectId, objectsFromDashboard, options);
            visWidgetUris.push(...Array.from(visWidgetMap.values()));
            const translator = createTranslator(kpiMap, visWidgetMap);
            const updatedContent = updateContent(analyticalDashboard, translator, filterContext);
            const dashboardTitle = this.getDashboardName(analyticalDashboard.meta.title, options.name);
            const duplicateDashboard: GdcDashboard.IAnalyticalDashboard = {
                ...dashboardDetails,
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
                    },
                },
            };

            const duplicateDashboardUri: string = (
                await this.metadataModule.createObject(projectId, duplicateDashboard)
            ).analyticalDashboard.meta.uri;

            return duplicateDashboardUri;
        } catch (err) {
            if (options.copyInsight || typeof options.copyInsight === "undefined") {
                visWidgetUris.forEach(uri => this.cascadingDelete(projectId, uri));
            } else {
                visWidgetUris.forEach(uri => this.metadataModule.deleteObject(uri));
            }
            allCreatedObjUris.forEach(uri => this.cascadingDelete(projectId, uri));
            alert(err);
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

    public async cascadingDelete(projectID: string, dashboardUri: string): Promise<void> {
        const objects: any[] = await this.metadataModule.getObjectUsing(projectID, dashboardUri);
        const currentUser: string = await (await this.userModule.getAccountInfo()).profileUri;

        const objectsToBeDeleted = objects
            .filter((object: any) => object.author === currentUser)
            .map((object: any) => {
                return object.link;
            });

        this.xhr.post(`/gdc/md/${projectID}/objects/delete`, {
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

    private async duplicateOrKeepKpis(
        projectId: string,
        objsFromDashboard: any[],
        options: ICopyDashboardOptions,
    ): Promise<Map<string, string>> {
        const uriMap: Map<string, string> = new Map();
        await Promise.all(
            objsFromDashboard
                .filter((obj: any) => this.unwrapObj(obj).meta.category === "kpi")
                .map(async (kpiWidget: any) => {
                    const { kpi }: { kpi: GdcKpi.IKPI } = kpiWidget;
                    if (options.copyKpi || typeof options.copyKpi === "undefined") {
                        const newUriKpiObj: string = (
                            await this.metadataModule.createObject(projectId, kpiWidget)
                        ).kpi.meta.uri;
                        uriMap.set(kpi.meta.uri, newUriKpiObj);
                    } else {
                        uriMap.set(kpi.meta.uri, kpi.meta.uri);
                    }
                }),
        );
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
        if (options.copyInsight || typeof options.copyInsight === "undefined") {
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
        Array<GdcKpi.IKPI | GdcDashboardExport.IFilterContext | GdcVisualizationWidget.IVisualizationWidget>
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
}
