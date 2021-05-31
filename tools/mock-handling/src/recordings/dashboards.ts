// (C) 2007-2021 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import fs from "fs";
import path from "path";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming";
import { IRecording, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import { RecordingFiles } from "../interface";

//
// internal constants & types
//

//
// Public API
//

export type DashboardRecordingSpec = {
    additionalFilterContexts?: string[];
};

export class DashboardRecording implements IRecording {
    public readonly directory: string;
    private readonly dashboardId: string;
    private readonly objFile: string;
    private readonly alertsFile: string;

    constructor(rootDir: string, id: string) {
        this.directory = path.join(rootDir, id);
        this.dashboardId = id;

        this.objFile = path.join(this.directory, RecordingFiles.Dashboards.Object);
        this.alertsFile = path.join(this.directory, RecordingFiles.Dashboards.Alerts);
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
        const ref = idRef(this.dashboardId);
        const dashboardWithReferences = await backend
            .workspace(workspace)
            .dashboards()
            .getDashboardWithReferences(ref);
        const alerts = await backend
            .workspace(workspace)
            .dashboards()
            .getDashboardWidgetAlertsForCurrentUser(ref);

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
