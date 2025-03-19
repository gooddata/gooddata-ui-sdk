// (C) 2007-2024 GoodData Corporation

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
    private readonly spec: DashboardRecordingSpec;

    constructor(rootDir: string, id: string, spec: DashboardRecordingSpec) {
        this.directory = path.join(rootDir, id);
        this.dashboardId = id;

        this.objFile = path.join(this.directory, RecordingFiles.Dashboards.Object);

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
        return fs.existsSync(this.directory) && fs.existsSync(this.objFile);
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            obj: this.objFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        if (this.spec.offline) {
            logError(
                `An offline recording for dashboard with id ${this.dashboardId} does not contain all necessary files. Please check that ${this.objFile} exist.`,
            );

            throw new DataRecorderError(
                `Incomplete recording for 'offline' dashboard ${this.dashboardId}.`,
                1,
            );
        }

        const ref = idRef(this.dashboardId);

        const [dashboardWithReferences] = await Promise.all([
            backend.workspace(workspace).dashboards().getDashboardWithReferences(ref),
        ]);

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string][] = [];

        if (newWorkspaceId) {
            replaceString.push([workspace, newWorkspaceId]);
        }

        replaceString.push([backend.config.hostname!, ""]);

        writeAsJsonSync(this.objFile, dashboardWithReferences, { replaceString });
    }
}
