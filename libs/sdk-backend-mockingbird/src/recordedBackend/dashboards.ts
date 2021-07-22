// (C) 2019-2021 GoodData Corporation

import {
    FilterContextItem,
    IDashboard,
    IDashboardDefinition,
    IDashboardWithReferences,
    IFilterContextDefinition,
    IListedDashboard,
    IScheduledMail,
    IScheduledMailDefinition,
    IWidget,
    IWidgetAlert,
    IWidgetAlertCount,
    IWidgetAlertDefinition,
    IWidgetReferences,
    IWorkspaceDashboardsService,
    NotSupported,
    SupportedWidgetReferenceTypes,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { IFilter, isIdentifierRef, ObjRef } from "@gooddata/sdk-model";
import values from "lodash/values";
import { DashboardRecording, RecordingIndex } from "./types";

export class RecordedDashboards implements IWorkspaceDashboardsService {
    public constructor(public readonly workspace: string, private readonly recordings: RecordingIndex) {}

    private findDashboardRecording(ref: ObjRef): DashboardRecording | undefined {
        return values(this.recordings.metadata?.dashboards ?? {}).find((recording) => {
            const {
                obj: { dashboard },
            } = recording;

            return isIdentifierRef(ref) ? ref.identifier === dashboard.identifier : ref.uri === dashboard.uri;
        });
    }

    public getDashboards(): Promise<IListedDashboard[]> {
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
                tags: dashboard.tags,
            } as IListedDashboard;
        });

        return Promise.resolve(result);
    }

    public getDashboard(ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> {
        if (filterContextRef) {
            throw new NotSupported("recorded backend does not support filter context override");
        }

        const recording = this.findDashboardRecording(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        return Promise.resolve(recording.obj.dashboard);
    }

    public getDashboardWidgetAlertsForCurrentUser(ref: ObjRef): Promise<IWidgetAlert[]> {
        const recording = this.findDashboardRecording(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        return Promise.resolve(recording.alerts);
    }

    public getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
    ): Promise<IDashboardWithReferences> {
        if (filterContextRef) {
            throw new NotSupported("recorded backend does not support filter context override");
        }

        const recording = this.findDashboardRecording(ref);

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError("Not Found", 404, {}));
        }

        return Promise.resolve(recording.obj);
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
        throw new NotSupported("recorded backend does not support this call");
    }

    public getScheduledMailsCountForDashboard(_ref: ObjRef): Promise<number> {
        throw new NotSupported("recorded backend does not support this call");
    }

    //
    // unsupported from down here
    //

    public createDashboard(_dashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public createScheduledMail(
        _scheduledMail: IScheduledMailDefinition,
        _exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public createWidgetAlert(_alert: IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteDashboard(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteWidgetAlert(_ref: ObjRef): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public deleteWidgetAlerts(_refs: ObjRef[]): Promise<void> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public exportDashboardToPdf(_ref: ObjRef, _filters?: FilterContextItem[]): Promise<string> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public updateDashboard(
        _dashboard: IDashboard,
        _updatedDashboard: IDashboardDefinition,
    ): Promise<IDashboard> {
        throw new NotSupported("recorded backend does not support this call");
    }

    public updateWidgetAlert(_alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("recorded backend does not support this call");
    }
}
