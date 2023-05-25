// (C) 2007-2021 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import fs from "fs";
import path from "path";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming.js";
import { IRecording, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common.js";
import { RecordingFiles } from "../interface.js";
import { DataRecorderError } from "../base/types.js";
import { logError } from "../cli/loggers.js";

//
// Public API
//

export type DashboardRecordingSpec = {
    offline?: boolean;
};

export class DashboardRecording implements IRecording {
    public readonly directory: string;
    private readonly dashboardId: string;
    private readonly objFile: string;
    private readonly alertsFile: string;
    private readonly spec: DashboardRecordingSpec;

    constructor(rootDir: string, id: string, spec: DashboardRecordingSpec) {
        this.directory = path.join(rootDir, id);
        this.dashboardId = id;

        this.objFile = path.join(this.directory, RecordingFiles.Dashboards.Object);
        this.alertsFile = path.join(this.directory, RecordingFiles.Dashboards.Alerts);

        this.spec = spec;
    }

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Dashboards;
    }

    public getRecordingName(): string {
        return `dash_${createUniqueVariableNameForIdentifier(this.dashboardId)}`;
    }

    public isComplete(): boolean {
        return fs.existsSync(this.directory) && fs.existsSync(this.objFile) && fs.existsSync(this.alertsFile);
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            obj: this.objFile,
            alerts: this.alertsFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        if (this.spec.offline) {
            logError(
                `An offline recording for dashboard with id ${this.dashboardId} does not contain all necessary files. Please check that ${this.objFile} and ${this.alertsFile} exist.`,
            );

            throw new DataRecorderError(
                `Incomplete recording for 'offline' dashboard ${this.dashboardId}.`,
                1,
            );
        }

        const ref = idRef(this.dashboardId);

        const [dashboardWithReferences, alerts] = await Promise.all([
            backend.workspace(workspace).dashboards().getDashboardWithReferences(ref),
            backend.workspace(workspace).dashboards().getDashboardWidgetAlertsForCurrentUser(ref),
        ]);

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        writeAsJsonSync(this.objFile, dashboardWithReferences, { replaceString });
        writeAsJsonSync(this.alertsFile, alerts, { replaceString });
    }
}
