// (C) 2020 GoodData Corporation
import { MetadataModule } from "./metadata";
import { UserModule } from "./user";
import { XhrModule } from "./xhr";
import cloneDeepWith from "lodash/cloneDeepWith";

/**
 * Modify how and what should be copied to the cloned dashboard
 */

export interface ICopyDashboardOptions {
    /** copy new kpi and reference it in the cloned dashboard */
    copyKpi: boolean;
    /** copy new insight and reference it in the cloned widget */
    copyInsight: boolean;
    /** optional, default value of name is "Copy of (current dashboard title)" */
    name?: string;
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
        const kpiMap = await this.duplicateOrKeepKpis(projectId, objectsFromDashboard, options);
        const visWidgetMap = await this.duplicateWidgets(projectId, objectsFromDashboard, options);
        const translator = createTranslator(kpiMap, visWidgetMap);
        const filterContext = await this.duplicateFilterContext(projectId, objectsFromDashboard);
        const updatedFluidLayout = await this.updateLayout(dashboardUri, translator);
        const updatedWidgets = await this.updateWidgets(dashboardUri, translator);
        const dashboardTitle = this.getDashboardName(
            dashboardDetails.analyticalDashboard.meta.title,
            options.name,
        );
        const duplicateDashboard = {
            ...dashboardDetails,
            analyticalDashboard: {
                ...dashboardDetails.analyticalDashboard,
                content: {
                    ...dashboardDetails.analyticalDashboard.content,
                    filterContext,
                    layout: {
                        ...dashboardDetails.analyticalDashboard.content.layout,
                        fluidLayout: updatedFluidLayout,
                    },
                    widgets: updatedWidgets,
                },
                meta: {
                    ...dashboardDetails.analyticalDashboard.meta,
                    title: dashboardTitle,
                },
            },
        };

        const duplicateDashboardUri = (await this.metadataModule.createObject(projectId, duplicateDashboard))
            .analyticalDashboard.meta.uri;

        return duplicateDashboardUri;
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
        const objects = await this.metadataModule.getObjectUsing(projectID, dashboardUri);
        const currentUserInfo = await (await this.userModule.getAccountInfo()).profileUri;

        const objectsToBeDeleted = objects
            .filter((object: any) => object.author === currentUserInfo)
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

    private async updateWidgets(dashboardUri: string, uriTranslator: UriTranslator): Promise<any> {
        const { analyticalDashboard } = await this.metadataModule.getObjectDetails(dashboardUri);

        return analyticalDashboard.content.widgets.map((uri: string) => {
            return uriTranslator(uri);
        });
    }

    private async updateLayout(dashboardUri: string, uriTranslator: UriTranslator): Promise<any> {
        const { analyticalDashboard } = await this.metadataModule.getObjectDetails(dashboardUri);
        return cloneDeepWith({ ...analyticalDashboard.content.layout.fluidLayout }, key => {
            const uri = key.uri;
            if (uri === undefined) {
                return;
            }
            return {
                ...key,
                uri: uriTranslator(uri),
            };
        });
    }

    private async duplicateOrKeepKpis(
        projectId: string,
        objsFromDashboard: any,
        options: ICopyDashboardOptions,
    ): Promise<any> {
        const uriMap: any = new Map();
        objsFromDashboard
            .filter((obj: any) => this.unwrapObj(obj).meta.category === "kpi")
            .map(async (kpiWidget: any) => {
                const { kpi } = kpiWidget;
                if (options.copyKpi) {
                    const newUriKpiObj = (await this.metadataModule.createObject(projectId, kpiWidget)).kpi
                        .meta.uri;
                    uriMap.set(kpi.meta.uri, newUriKpiObj);
                } else {
                    uriMap.set(kpi.meta.uri, kpi.meta.uri);
                }
            });
        return uriMap;
    }

    private async duplicateWidgets(
        projectId: string,
        objsFromDashboard: any,
        options: ICopyDashboardOptions,
    ): Promise<any> {
        const uriMap: any = new Map();

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
        uriMap: any,
    ) {
        const { visualizationWidget } = visWidget;
        if (options.copyInsight) {
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

    private async getObjectsFromDashboard(projectId: string, dashboardUri: string): Promise<any> {
        const uris = await this.getObjectsUrisInDashboard(projectId, dashboardUri);
        return this.metadataModule.getObjects(projectId, uris);
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

type UriTranslator = (oldUri: string) => string;

function createTranslator(kpiMap: any, visWidgetMap: any): UriTranslator {
    return (oldUri: string): string => {
        if (kpiMap.get(oldUri) !== undefined) {
            return kpiMap.get(oldUri);
        } else if (visWidgetMap.get(oldUri) !== undefined) {
            return visWidgetMap.get(oldUri);
        } else {
            return oldUri;
        }
    };
}
