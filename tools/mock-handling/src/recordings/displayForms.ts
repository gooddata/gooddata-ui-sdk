// (C) 2007-2019 GoodData Corporation

import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import { IAnalyticalBackend, IElementQuery } from "@gooddata/sdk-backend-spi";
import { isEqual } from "lodash";
import fs from "fs";
import path from "path";
import { IAttributeElement } from "@gooddata/sdk-model";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming";

//
// internal constants & types
//

//
// Public API
//

export const DisplayFormsDefinition = "displayForms.json";
const DisplayFormRequestFile = "request.json";
const DisplayFormElements = "elements.json";
const DisplayFormObj = "obj.json";

export type DisplayFormRequest = {
    offset?: number;
    elementCount?: number;
};

export class DisplayFormRecording implements IRecording {
    public readonly directory: string;
    private readonly displayFormId: string;
    private readonly request: DisplayFormRequest;
    private readonly requestFile: string;
    private readonly elementFile: string;
    private readonly objFile: string;

    constructor(rootDir: string, displayFormId: string, request: DisplayFormRequest = {}) {
        this.directory = path.join(rootDir, displayFormId);
        this.displayFormId = displayFormId;
        this.request = request;

        this.requestFile = path.join(this.directory, DisplayFormRequestFile);
        this.elementFile = path.join(this.directory, DisplayFormElements);
        this.objFile = path.join(this.directory, DisplayFormObj);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.DisplayForms;
    }

    public getRecordingName(): string {
        return `df_${createUniqueVariableNameForIdentifier(this.displayFormId)}`;
    }

    public isComplete(): boolean {
        return (
            fs.existsSync(this.directory) &&
            fs.existsSync(this.elementFile) &&
            fs.existsSync(this.objFile) &&
            isEqual(this.request, this.getRecordedRequest())
        );
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            elements: this.elementFile,
            obj: this.objFile,
        };
    }

    public async makeRecording(backend: IAnalyticalBackend, workspace: string): Promise<void> {
        const elements = await this.queryValidElements(backend, workspace);
        const obj = await backend
            .workspace(workspace)
            .metadata()
            .getAttributeDisplayForm(this.displayFormId);

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        writeAsJsonSync(this.requestFile, this.request);
        writeAsJsonSync(this.elementFile, elements);
        writeAsJsonSync(this.objFile, obj);
    }

    private async queryValidElements(
        backend: IAnalyticalBackend,
        workspace: string,
    ): Promise<IAttributeElement[]> {
        const validElements = this.createValidElementsQuery(backend, workspace);
        const result: IAttributeElement[] = [];
        const { elementCount } = this.request;

        let page = await validElements.query();

        /*
         * Keep loading elements until:
         *
         * - desired element count reached (if any)
         * - last page of data reached
         *
         */
        while ((!elementCount || elementCount > result.length) && page.items && page.items.length > 0) {
            result.push(...page.items);

            page = await page.next();
        }

        return !elementCount ? result : result.slice(0, elementCount);
    }

    private createValidElementsQuery(backend: IAnalyticalBackend, workspace: string): IElementQuery {
        const { offset, elementCount } = this.request;

        let validElements = backend
            .workspace(workspace)
            .elements()
            .forObject(this.displayFormId);

        if (offset !== undefined) {
            validElements = validElements.withOffset(offset);
        }

        if (elementCount !== undefined) {
            validElements = validElements.withLimit(elementCount);
        }

        return validElements;
    }

    private getRecordedRequest(): DisplayFormRequest {
        if (!fs.existsSync(this.requestFile)) {
            return {};
        }

        return readJsonSync(this.requestFile) as DisplayFormRequest;
    }
}
