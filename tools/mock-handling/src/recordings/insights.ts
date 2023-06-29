// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import fs from "fs";
import path from "path";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming.js";
import { IRecording, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common.js";
import isEmpty from "lodash/isEmpty.js";
import { InsightRecordingSpec, RecordingFiles } from "../interface.js";

//
// internal constants & types
//

//
// Public API
//

export class InsightRecording implements IRecording {
    public readonly directory: string;
    private readonly insightId: string;
    private readonly objFile: string;
    private readonly spec: InsightRecordingSpec;

    constructor(rootDir: string, id: string, spec: InsightRecordingSpec = {}) {
        this.directory = path.join(rootDir, id);
        this.insightId = id;
        this.spec = spec;

        this.objFile = path.join(this.directory, RecordingFiles.Insights.Object);
    }

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Insights;
    }

    public getRecordingName(): string {
        return `i_${createUniqueVariableNameForIdentifier(this.insightId)}`;
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
        const obj: any = await backend.workspace(workspace).insights().getInsight(idRef(this.insightId));

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        /*
         * Do not store ref, let the recorded backend fill-in
         */
        delete obj.insight.ref;

        writeAsJsonSync(this.objFile, obj, { replaceString });
    }

    public getVisName(): string {
        return this.spec.visName!;
    }

    public getScenarioName(): string {
        return this.spec.scenarioName!;
    }

    /**
     * Tests whether the recording contains information about visualization and scenario that the
     * insight exercises. This information is essential for the recording to be included in the named
     * insights index.
     */
    public hasVisAndScenarioInfo(): boolean {
        return !isEmpty(this.spec.visName) && !isEmpty(this.spec.scenarioName);
    }
}
