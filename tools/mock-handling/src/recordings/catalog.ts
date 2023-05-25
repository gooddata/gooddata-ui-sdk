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

export const CatalogDefinition = "catalog.json";
const CatalogItems = "items.json";
const CatalogGroups = "groups.json";

export class CatalogRecording implements IRecording {
    public readonly directory: string;
    private readonly itemsFile: string;
    private readonly groupsFile: string;

    constructor(rootDir: string) {
        this.directory = path.join(rootDir, "catalog");

        this.itemsFile = path.join(this.directory, CatalogItems);
        this.groupsFile = path.join(this.directory, CatalogGroups);
    }

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Catalog;
    }

    public getRecordingName(): string {
        return "catalog";
    }

    public isComplete(): boolean {
        return (
            fs.existsSync(this.directory) && fs.existsSync(this.itemsFile) && fs.existsSync(this.groupsFile)
        );
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            items: this.itemsFile,
            groups: this.groupsFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        const catalog = await backend.workspace(workspace).catalog().load();

        const items = catalog.allItems();
        const groups = catalog.groups();

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        writeAsJsonSync(this.itemsFile, items, { replaceString });
        writeAsJsonSync(this.groupsFile, groups, { replaceString });
    }
}
