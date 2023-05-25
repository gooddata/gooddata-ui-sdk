// (C) 2007-2022 GoodData Corporation

import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common.js";
import { IAnalyticalBackend, IElementsQuery } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual.js";
import fs from "fs";
import path from "path";
import { idRef, IAttributeDisplayFormMetadataObject, IAttributeElement } from "@gooddata/sdk-model";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming.js";

//
// internal constants & types
//

//
// Public API
//

export const DisplayFormsDefinition = "displayForms.json";
export const DashboardsDefinition = "dashboards.json";
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

    public alwaysRefresh(): boolean {
        return false;
    }

    public getRecordingType(): RecordingType {
        return RecordingType.DisplayForms;
    }

    public getRecordingName(): string {
        return `df_${createUniqueVariableNameForIdentifier(this.displayFormId)}`;
    }

    public getAttributeElements(): IAttributeElement[] {
        return readJsonSync(this.elementFile) as IAttributeElement[];
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
            req: this.requestFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        const elements = await this.queryValidElements(backend, workspace);
        const obj = await backend
            .workspace(workspace)
            .attributes()
            .getAttributeDisplayForm(idRef(this.displayFormId));

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        writeAsJsonSync(this.requestFile, this.spec, { replaceString });
        writeAsJsonSync(this.elementFile, elements, { replaceString });
        writeAsJsonSync(this.objFile, obj, { replaceString });
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
        while ((!elementCount || elementCount > result.length) && page.items?.length > 0) {
            result.push(...page.items);

            page = await page.next();
        }

        return !elementCount ? result : result.slice(0, elementCount);
    }

    private createValidElementsQuery(backend: IAnalyticalBackend, workspace: string): IElementsQuery {
        const { offset, elementCount } = this.spec;

        let validElements = backend
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(idRef(this.displayFormId));

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
