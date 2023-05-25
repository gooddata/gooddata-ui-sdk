// (C) 2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import fs from "fs";
import path from "path";
import { IRecording, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common.js";

//
// internal constants & types
//

//
// Public API
//

export const VisClassesDefinition = "visClasses.json";
const VisClassesItems = "items.json";

export class VisClassesRecording implements IRecording {
    public readonly directory: string;
    private readonly itemsFile: string;

    constructor(rootDir: string) {
        this.directory = path.join(rootDir, "visClasses");

        this.itemsFile = path.join(this.directory, VisClassesItems);
    }

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingType(): RecordingType {
        return RecordingType.VisClasses;
    }

    public getRecordingName(): string {
        return "visClasses";
    }

    public isComplete(): boolean {
        return fs.existsSync(this.directory) && fs.existsSync(this.itemsFile);
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            items: this.itemsFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        const items = await backend.workspace(workspace).insights().getVisualizationClasses();

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        writeAsJsonSync(this.itemsFile, items, { replaceString });
    }
}
