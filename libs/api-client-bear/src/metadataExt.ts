// (C) 2020-2022 GoodData Corporation
import { MetadataModule } from "./metadata.js";
import { XhrModule } from "./xhr.js";
import { UserModule } from "./user.js";
import cloneDeepWith from "lodash/cloneDeepWith.js";
import compact from "lodash/compact.js";
import omit from "lodash/omit.js";
import {
    GdcKpi,
    GdcDashboard,
    GdcFilterContext,
    GdcVisualizationWidget,
    GdcMetadata,
    GdcVisualizationObject,
} from "@gooddata/api-model-bear";

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
    /** optional, default value of tags is (current dashboard tags) */
    tags?: string;
    /** optional, if true, the isLocked flag will be cleared for the newly created dashboard, defaults to false */
    clearLockedFlag?: boolean;
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
 * Remove fields that we do not want to send (either because the server will generate them anyway, or because of options)
 * @param originalMeta - the meta to start with
 * @param options - the options relevant to this particular run
 */
function getSanitizedMeta(
    originalMeta: GdcMetadata.IObjectMeta,
    options: ICopyDashboardOptions,
): GdcMetadata.IObjectMeta {
    return omit(
        originalMeta,
        compact([
            "identifier",
            "uri",
            "author",
            "created",
            "updated",
            "contributor",
            options?.clearLockedFlag && "locked",
        ]),
    );
}

/**
 * Updates content of the dashboard
 *
 * @param dashboardUri - uri of dashboard
 * @param uriTranslator - gets updated widgets and kpis uri
 * @param filterContext - updated filter context uri
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
     * @param projectId - id of the project
     * @param dashboardUri - uri of the dashboard
     * @param options - object with options:
     *          - default - dashboard is cloned with new kpi reference and visualization widget is cloned with new
     *              visualization object reference
     *          - copyKpi - choose whether dashboard is cloned with new Kpi reference
     *          - copyVisObj - choose whether visualization widget is cloned with new visualization object reference
     *          - name - optional - choose name, default value is "Copy of (old title of the dashboard)"
     *          - summary - choose summary, default is the summary of the original dashboard
     *          - tags - choose tags, default is the tags of the original dashboard
     *          - clearLockedFlag - if true, the isLocked flag will be cleared for the newly created dashboard, defaults to false
     * @returns uri of cloned dashboard
     * @experimental
     */

    public async saveDashboardAs(
        projectId: string,
        dashboardUri: string,
        options: ICopyDashboardOptions,
    ): Promise<string> {
        const objectsFromDashboard = await this.getObjectsFromDashboard(projectId, dashboardUri);
        const dashboardDetails = await this.metadataModule.getObjectDetails(dashboardUri);
        const { analyticalDashboard }: { analyticalDashboard: GdcDashboard.IAnalyticalDashboard } =
            dashboardDetails;
        const allCreatedObjUris: string[] = [];
        const visWidgetUris: string[] = [];
        try {
            const filterContext = await this.duplicateFilterContext(projectId, objectsFromDashboard, options);
            allCreatedObjUris.push(filterContext);
            const kpiMap = await this.duplicateOrKeepKpis(projectId, objectsFromDashboard, options);
            if (this.shouldCopyKpi(options)) {
                allCreatedObjUris.push(...Array.from(kpiMap.values()));
            }
            const visWidgetMap = await this.duplicateWidgets(projectId, objectsFromDashboard, options);
            visWidgetUris.push(...Array.from(visWidgetMap.values()));
            const translator = createTranslator(kpiMap, visWidgetMap);
            const updatedContent = updateContent(analyticalDashboard, translator, filterContext);

            const duplicateDashboard: GdcDashboard.IWrappedAnalyticalDashboard = {
                analyticalDashboard: {
                    ...dashboardDetails.analyticalDashboard,
                    content: {
                        filterContext,
                        layout: { ...updatedContent.layout },
                        widgets: [...updatedContent.widgets],
                    },
                    meta: {
                        ...getSanitizedMeta(dashboardDetails.analyticalDashboard.meta, options),
                        title: options.name ?? `Copy of ${analyticalDashboard.meta.title}`,
                        summary: options.summary ?? analyticalDashboard.meta.summary ?? "",
                        tags: options.tags ?? analyticalDashboard.meta.tags,
                    },
                },
            };

            return (await this.metadataModule.createObject(projectId, duplicateDashboard)).analyticalDashboard
                .meta.uri!;
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
     * @param projectId - Project identifier
     * @param dashboardUri - Uri of a dashboard to be deleted
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
                        const toSave: GdcKpi.IWrappedKPI = {
                            kpi: {
                                meta: getSanitizedMeta(kpi.meta, options),
                                content: { ...kpi.content },
                            },
                        };
                        const newUriKpiObj: string = (
                            await this.metadataModule.createObject(projectId, toSave)
                        ).kpi.meta.uri!;
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
            const toSave: GdcVisualizationObject.IVisualization = {
                visualizationObject: {
                    meta: getSanitizedMeta(visObj.visualizationObject.meta, options),
                    content: { ...visObj.visualizationObject.content },
                },
            };
            const newUriVisObj = (await this.metadataModule.createObject(projectId, toSave))
                .visualizationObject.meta.uri;

            const updatedVisWidget: GdcVisualizationWidget.IWrappedVisualizationWidget = {
                visualizationWidget: {
                    meta: getSanitizedMeta(visWidget.visualizationWidget.meta, options),
                    content: {
                        ...visWidget.visualizationWidget.content,
                        visualization: newUriVisObj,
                    },
                },
            };
            const visUri = (await this.metadataModule.createObject(projectId, updatedVisWidget))
                .visualizationWidget.meta.uri!;
            uriMap.set(visualizationWidget.meta.uri, visUri);
        } else {
            const updatedVisWidget: GdcVisualizationWidget.IWrappedVisualizationWidget = {
                visualizationWidget: {
                    meta: getSanitizedMeta(visWidget.visualizationWidget.meta, options),
                    content: { ...visWidget.visualizationWidget.content },
                },
            };
            const { visualizationWidget } = await this.metadataModule.createObject(
                projectId,
                updatedVisWidget,
            );
            uriMap.set(visWidget.visualizationWidget.meta.uri, visualizationWidget.meta.uri!);
        }
    }

    private async duplicateFilterContext(
        projectId: string,
        objsFromDashboard: any,
        options: ICopyDashboardOptions,
    ): Promise<string> {
        const originalFilterContext = objsFromDashboard.filter(
            (obj: any) => this.unwrapObj(obj).meta.category === "filterContext",
        )[0];

        const toSave: GdcFilterContext.IWrappedFilterContext = {
            filterContext: {
                meta: getSanitizedMeta(originalFilterContext.filterContext.meta, options),
                content: { ...originalFilterContext.filterContext.content },
            },
        };

        const { filterContext } = await this.metadataModule.createObject(projectId, toSave);
        return filterContext.meta.uri!;
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
