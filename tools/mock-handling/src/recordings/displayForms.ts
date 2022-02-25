// (C) 2007-2022 GoodData Corporation

import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import {
    IAnalyticalBackend,
    IAttributeElement,
    IElementsQuery,
    IAttributeDisplayFormMetadataObject,
    IElementsQueryOptions,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual";
import fs from "fs";
import path from "path";
import { idRef, IMeasure, IRelativeDateFilter } from "@gooddata/sdk-model";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming";
import {
    elementsQueryParamsFingerprint,
    elementsQueryParamsToElementsEntryId,
    elementsQueryParamsToRequestEntryId,
} from "@gooddata/sdk-backend-mockingbird";
import uniqBy from "lodash/uniqBy";
import flatten from "lodash/flatten";

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
    params?: {
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: IRelativeDateFilter[];
        measures?: IMeasure[];
    };
    offset?: number;
    elementCount?: number;
};

export type DisplayFormsEntryFile = {
    [displayFormId: string]: DisplayFormRecordingSpec[];
};

export class DisplayFormRecording implements IRecording {
    public readonly directory: string;
    private readonly displayFormId: string;
    private readonly specs: DisplayFormRecordingSpec[];
    public readonly specDirs: string[];
    public readonly elementFiles: string[];
    private readonly requestFiles: string[];
    private readonly objFile: string;

    constructor(rootDir: string, displayFormId: string, specs: DisplayFormRecordingSpec[] = []) {
        this.directory = path.join(rootDir, displayFormId);
        this.displayFormId = displayFormId;
        this.specs = specs;

        this.specDirs = this.specs.map((spec) => {
            const specParams = elementsQueryParamsFingerprint(spec.params);
            if (specParams) {
                return path.join(this.directory, `/${elementsQueryParamsFingerprint(spec.params)}/`);
            }

            return this.directory;
        });
        this.requestFiles = this.specDirs.map((specDir) => path.join(specDir, DisplayFormRequestFile));
        this.elementFiles = this.specDirs.map((specDir) => path.join(specDir, DisplayFormElements));
        this.objFile = path.join(this.directory, DisplayFormObj);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.DisplayForms;
    }

    public getRecordingName(): string {
        return `df_${createUniqueVariableNameForIdentifier(this.displayFormId)}`;
    }

    public getAttributeElements(): IAttributeElement[] {
        return uniqBy(flatten(this.elementFiles.map(readJsonSync)) as IAttributeElement[], (el) => el.title);
    }

    public getDisplayFormTitle(): string {
        const obj = readJsonSync(this.objFile) as IAttributeDisplayFormMetadataObject;

        return obj.title;
    }

    public isComplete(): boolean {
        return (
            fs.existsSync(this.directory) &&
            this.elementFiles.every(fs.existsSync) &&
            this.requestFiles.every(fs.existsSync) &&
            fs.existsSync(this.objFile) &&
            isEqual(this.specs, this.getRecordedSpecs())
        );
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        const elementsAndRequests = this.specs.reduce((acc: RecordingIndexEntry, spec, i) => {
            acc[elementsQueryParamsToElementsEntryId(spec.params)] = this.elementFiles[i];
            acc[elementsQueryParamsToRequestEntryId(spec.params)] = this.requestFiles[i];
            return acc;
        }, {});

        return {
            ...elementsAndRequests,
            obj: this.objFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        const elementsResults = await Promise.all(
            this.specs.map((spec) => this.queryValidElements(backend, workspace, spec)),
        );
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

        writeAsJsonSync(this.objFile, obj, { replaceString });
        this.specs.forEach((spec, i) => {
            const specDir = this.specDirs[i];
            const elementFile = this.elementFiles[i];
            const requestFile = this.requestFiles[i];
            const elementResults = elementsResults[i];

            if (!fs.existsSync(specDir)) {
                fs.mkdirSync(specDir, { recursive: true });
            }

            writeAsJsonSync(elementFile, elementResults, { replaceString });
            writeAsJsonSync(requestFile, spec, { replaceString });
        });
    }

    private async queryValidElements(
        backend: IAnalyticalBackend,
        workspace: string,
        spec: DisplayFormRecordingSpec,
    ): Promise<IAttributeElement[]> {
        const validElements = this.createValidElementsQuery(backend, workspace, spec);
        const result: IAttributeElement[] = [];
        const { elementCount } = spec;

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

    private createValidElementsQuery(
        backend: IAnalyticalBackend,
        workspace: string,
        spec: DisplayFormRecordingSpec,
    ): IElementsQuery {
        const { offset, params: { attributeFilters, dateFilters, measures, options } = {} } = spec;

        let validElements = backend
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(idRef(this.displayFormId));

        if (attributeFilters) {
            validElements = validElements.withAttributeFilters(attributeFilters);
        }
        if (dateFilters) {
            validElements = validElements.withDateFilters(dateFilters);
        }
        if (measures) {
            validElements = validElements.withMeasures(measures);
        }
        if (options) {
            validElements = validElements.withOptions(options);
        }
        if (offset) {
            validElements = validElements.withOffset(offset);
        }

        return validElements;
    }

    private getRecordedSpecs(): DisplayFormRecordingSpec[] {
        if (!this.requestFiles.every(fs.existsSync)) {
            return [];
        }

        return this.requestFiles.map(readJsonSync) as DisplayFormRecordingSpec[];
    }
}
