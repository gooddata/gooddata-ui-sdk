// (C) 2019-2023 GoodData Corporation

import {
    IDashboardReferences,
    IDashboardWithReferences,
    IGetDashboardOptions,
    IGetScheduledMailOptions,
    IWidgetAlertCount,
    IWidgetReferences,
    IWorkspaceDashboardsService,
    IWorkspaceInsightsService,
    NotSupported,
    SupportedDashboardReferenceTypes,
    SupportedWidgetReferenceTypes,
    UnexpectedResponseError,
    walkLayout,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    idRef,
    IFilter,
    IInsight,
    isIdentifierRef,
    ObjRef,
    FilterContextItem,
    IFilterContextDefinition,
    isFilterContextDefinition,
    IWidgetAlert,
    IWidgetAlertDefinition,
    IWidget,
    isKpiWidgetDefinition,
    isInsightWidgetDefinition,
    isInsightWidget,
    IScheduledMail,
    IScheduledMailDefinition,
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPermissions,
    IExistingDashboard,
} from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import values from "lodash/values.js";
import { DashboardRecording, RecordingIndex } from "./types.js";
import { v4 as uuidv4 } from "uuid";
import isEmpty from "lodash/isEmpty.js";
import includes from "lodash/includes.js";

function isDashboardRecording(obj: unknown): obj is DashboardRecording {
    return !isEmpty(obj) && (obj as any).obj !== undefined;
}

export class RecordedDashboards implements IWorkspaceDashboardsService {
    private localDashboards: IDashboard[] = [];
    public constructor(
        public readonly workspace: string,
        private readonly insights: IWorkspaceInsightsService,
        private readonly recordings: RecordingIndex,
    ) {}

    private findRecordingOrLocalDashboard(ref: ObjRef): DashboardRecording | IDashboard | undefined {
        const recordedDashboard = values(this.recordings.metadata?.dashboards ?? {}).find((recording) => {
            const {
                obj: { dashboard },
            } = recording;

            return isIdentifierRef(ref) ? ref.identifier === dashboard.identifier : ref.uri === dashboard.uri;
        });

        if (recordedDashboard) {
            return recordedDashboard;
        }

        return this.localDashboards.find((dashboard) => {
            return isIdentifierRef(ref) ? ref.identifier === dashboard.identifier : ref.uri === dashboard.uri;
        });
    }

    private addOrUpdateLocalDashboard(dashboard: IDashboard): void {
        const ref = dashboard.ref;
        const idx = this.localDashboards.findIndex((dashboard) => {
            return isIdentifierRef(ref) ? ref.identifier === dashboard.identifier : ref.uri === dashboard.uri;
        });

        if (idx >= 0) {
            this.localDashboards = this.localDashboards.splice(idx, 1, dashboard);
        } else {
            this.localDashboards.push(dashboard);
        }
    }

    public getDashboards = (): Promise<IListedDashboard[]> => {
        const result = values(this.recordings.metadata?.dashboards ?? {}).map((recording) => {
            const {
                obj: { dashboard },
            } = recording;
            return {
                ref: dashboard.ref,
                uri: dashboard.uri,
                identifier: dashboard.identifier,
                title: dashboard.title,
                created: dashboard.created,
                description: dashboard.description,
                updated: dashboard.updated,
                tags: dashboard.tags ?? [],
            } as IListedDashboard;
        });

        return Promise.resolve(result);
    };

    public getDashboard = (ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> => {
        if (filterContextRef) {
            throw new NotSupported("recorded backend does not support filter context override");
        }

        const recording = this.findRecordingOrLocalDashboard(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        if (isDashboardRecording(recording)) {
            return Promise.resolve(recording.obj.dashboard);
        }

        return Promise.resolve(recording);
    };

    public getDashboardWidgetAlertsForCurrentUser = (ref: ObjRef): Promise<IWidgetAlert[]> => {
        const recording = this.findRecordingOrLocalDashboard(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        if (isDashboardRecording(recording)) {
            return Promise.resolve(recording.alerts);
        }

        return Promise.resolve([]);
    };

    public getDashboardWithReferences = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
        _options?: IGetDashboardOptions,
        types: SupportedDashboardReferenceTypes[] = ["insight"],
    ): Promise<IDashboardWithReferences> => {
        if (filterContextRef) {
            throw new NotSupported("recorded backend does not support filter context override");
        }

        const recording = this.findRecordingOrLocalDashboard(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        if (isDashboardRecording(recording)) {
            const { dashboard, references } = recording.obj;

            return Promise.resolve({
                dashboard: dashboard,
                references: removeUnneededReferences(references, types),
            });
        }

        const insightsPromise: Array<Promise<IInsight>> = [];

        if (includes(types, "insight")) {
            walkLayout(recording.layout!, {
                widgetCallback: (widget) => {
                    if (isInsightWidgetDefinition(widget) || isInsightWidget(widget)) {
                        insightsPromise.push(this.insights.getInsight(widget.insight));
                    }
                },
            });
        }

        const insights = await Promise.all(insightsPromise);

        return Promise.resolve({
            dashboard: recording,
            references: {
                insights,
                plugins: [],
            },
        });
    };

    public getDashboardReferencedObjects = (
        dashboard: IDashboard,
        types: SupportedDashboardReferenceTypes[] = ["insight", "dashboardPlugin"],
    ): Promise<IDashboardReferences> => {
        const fullDashboard = this.getDashboardWithReferences(dashboard.ref, undefined, undefined, types);

        return fullDashboard.then((dashboard) => dashboard.references);
    };

    public createDashboard = (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        const emptyDashboard: IDashboardDefinition = {
            type: "IDashboard",
            description: "",
            filterContext: undefined,
            title: "",
            shareStatus: "private",
            isUnderStrictControl: true,
        };

        return this.updateDashboard(emptyDashboard as IDashboard, dashboard);
    };

    public updateDashboard = async (
        dashboard: IDashboard,
        updatedDashboard: IDashboardDefinition,
    ): Promise<IDashboard> => {
        if (!areObjRefsEqual(dashboard.ref, updatedDashboard.ref)) {
            throw new Error("Cannot update dashboard with different refs!");
        } else if (isEqual(dashboard, updatedDashboard)) {
            return dashboard;
        }

        let savedDashboard: Partial<IDashboard> = cloneDeep(updatedDashboard) as Partial<IDashboard>;

        if (!savedDashboard.ref) {
            const newId = uuidv4();

            savedDashboard = {
                ...savedDashboard,
                identifier: newId,
                uri: newId,
                ref: idRef(newId),
                created: "2021-01-01 01:01:00",
                updated: "2021-01-01 01:01:00",
            };
        }

        if (isFilterContextDefinition(savedDashboard.filterContext)) {
            const newId = uuidv4();
            // use either existing identity and default to new identity
            const { identifier = newId, uri = newId, ref = idRef(newId) } = savedDashboard.filterContext;

            savedDashboard = {
                ...savedDashboard,
                filterContext: {
                    ...savedDashboard.filterContext,
                    identifier,
                    uri,
                    ref,
                },
            };
        }

        walkLayout(savedDashboard.layout!, {
            widgetCallback: (widget) => {
                if (isKpiWidgetDefinition(widget) || isInsightWidgetDefinition(widget)) {
                    const newId = uuidv4();

                    (widget as any).identifier = newId;
                    (widget as any).uri = newId;
                    (widget as any).ref = idRef(newId);
                }
            },
        });

        this.addOrUpdateLocalDashboard(savedDashboard as IDashboard);

        return savedDashboard as IDashboard;
    };

    public deleteDashboard(_ref: ObjRef): Promise<void> {
        return Promise.resolve();
    }

    //
    //
    //

    public getWidgetAlertsCountForWidgets(_refs: ObjRef[]): Promise<IWidgetAlertCount[]> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getWidgetReferencedObjects(
        _widget: IWidget,
        _types?: SupportedWidgetReferenceTypes[],
    ): Promise<IWidgetReferences> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getResolvedFiltersForWidget(_widget: IWidget, _filters: IFilter[]): Promise<IFilter[]> {
        return Promise.resolve([
            {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: "/example/md/mock/123",
                    },
                    notIn: {
                        uris: ["/example/md/mock/124"],
                    },
                },
            },
        ]);
    }

    public getScheduledMailsForDashboard(
        _ref: ObjRef,
        _options?: IGetScheduledMailOptions,
    ): Promise<IScheduledMail[]> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getScheduledMailsCountForDashboard(_ref: ObjRef): Promise<number> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public exportDashboardToPdf(_ref: ObjRef, _filters?: FilterContextItem[]): Promise<string> {
        return Promise.resolve("/example/export.pdf");
    }

    public exportDashboardToPdfBlob(
        _ref: ObjRef,
        _filters?: FilterContextItem[],
    ): Promise<IExportBlobResult> {
        return Promise.resolve({
            uri: "/example/export.pdf",
            objectUrl: "blob:/01345454545454",
            fileName: "export.pdf",
        });
    }

    //
    // unsupported from down here
    //

    public createScheduledMail(
        _scheduledMail: IScheduledMailDefinition,
        _exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public updateScheduledMail(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteScheduledMail(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public createWidgetAlert(_alert: IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteWidgetAlert(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteWidgetAlerts(_refs: ObjRef[]): Promise<void> {
        return Promise.resolve();
    }

    public updateWidgetAlert(_alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public createDashboardPlugin(_plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteDashboardPlugin(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getDashboardPlugin(_ref: ObjRef): Promise<IDashboardPlugin> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getDashboardPlugins(): Promise<IDashboardPlugin[]> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public getDashboardPermissions(): Promise<IDashboardPermissions> {
        return Promise.resolve({
            canEditDashboard: true,
            canEditLockedDashboard: true,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canViewDashboard: true,
        });
    }

    public validateDashboardsExistence(_dashboardRefs: ObjRef[]): Promise<IExistingDashboard[]> {
        return Promise.resolve([]);
    }
}

function removeUnneededReferences(
    references: IDashboardReferences,
    types: SupportedDashboardReferenceTypes[],
): IDashboardReferences {
    return {
        insights: includes(types, "insight") ? references.insights : [],
        plugins: includes(types, "dashboardPlugin") ? references.plugins : [],
    };
}
