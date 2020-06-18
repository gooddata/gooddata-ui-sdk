// (C) 2007-2020 GoodData Corporation

import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import { IAnalyticalBackend, IElementQuery } from "@gooddata/sdk-backend-spi";
import { isEqual } from "lodash";
import fs from "fs";
import path from "path";
import { IAttributeElement, idRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
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

export type DisplayFormRecordingSpec = {
    offset?: number;
    elementCount?: number;
};

export class DisplayFormRecording implements IRecording {
    public readonly directory: string;
    public readonly elementFile: string;
    private readonly displayFormId: string;
    private readonly spec: DisplayFormRecordingSpec;
    private readonly requestFile: string;
    private readonly objFile: string;

    constructor(rootDir: string, displayFormId: string, spec: DisplayFormRecordingSpec = {}) {
        this.directory = path.join(rootDir, displayFormId);
        this.displayFormId = displayFormId;
        this.spec = spec;

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

    public getAttributeElements(): IAttributeElement[] {
        const elements = readJsonSync(this.elementFile) as IAttributeElement[];

        return elements;
    }

    public getDisplayFormTitle(): string {
        const obj = readJsonSync(this.objFile) as IAttributeDisplayFormMetadataObject;

        return obj.title;
    }

    public isComplete(): boolean {
        return (
            fs.existsSync(this.directory) &&
            fs.existsSync(this.elementFile) &&
            fs.existsSync(this.objFile) &&
            isEqual(this.spec, this.getRecordedSpec())
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
            .getAttributeDisplayForm(idRef(this.displayFormId));

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        writeAsJsonSync(this.requestFile, this.spec);
        writeAsJsonSync(this.elementFile, elements);
        writeAsJsonSync(this.objFile, obj);
    }

    private async queryValidElements(
        backend: IAnalyticalBackend,
        workspace: string,
    ): Promise<IAttributeElement[]> {
        const validElements = this.createValidElementsQuery(backend, workspace);
        const result: IAttributeElement[] = [];
        const { elementCount } = this.spec;

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
        const { offset, elementCount } = this.spec;

        let validElements = backend.workspace(workspace).elements().forDisplayForm(idRef(this.displayFormId));

        if (offset !== undefined) {
            validElements = validElements.withOffset(offset);
        }

        if (elementCount !== undefined) {
            validElements = validElements.withLimit(elementCount);
        }

        return validElements;
    }

    private getRecordedSpec(): DisplayFormRecordingSpec {
        if (!fs.existsSync(this.requestFile)) {
            return {};
        }

        return readJsonSync(this.requestFile) as DisplayFormRecordingSpec;
    }
}
