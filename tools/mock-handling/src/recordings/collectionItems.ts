// (C) 2007-2026 GoodData Corporation

import fs from "fs";
import path from "path";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IRecording, type RecordingIndexEntry, RecordingType } from "./common.js";

const CollectionItemsResultFile = "result.json";

export class CollectionItemsRecording implements IRecording {
    public readonly directory: string;
    public readonly key: string;

    constructor(directory: string) {
        this.directory = directory;
        this.key = path.basename(directory);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.CollectionItems;
    }

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingName(): string {
        return `collectionItems_${this.key}`;
    }

    public isComplete(): boolean {
        return fs.existsSync(path.join(this.directory, CollectionItemsResultFile));
    }

    public async makeRecording(_backend: IAnalyticalBackend, _workspace: string): Promise<void> {
        return Promise.resolve();
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            result: path.join(this.directory, CollectionItemsResultFile),
        };
    }
}
