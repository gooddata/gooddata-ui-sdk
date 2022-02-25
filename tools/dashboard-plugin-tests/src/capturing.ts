// (C) 2019-2022 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IElementsQueryAttributeFilter,
    IElementsQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IMeasure, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
import { DataViewWindow } from "@gooddata/sdk-ui";

export type CapturedElementQuery = {
    ref: ObjRef;
    offset?: number;
    limit?: number;
    options?: IElementsQueryOptions;
    attributeFilters?: IElementsQueryAttributeFilter[];
    dateFilters?: IRelativeDateFilter[];
    measures?: IMeasure[];
};

export type CapturedData = {
    dashboards: string[];
    executions: {
        [executionId: string]: {
            definition: IExecutionDefinition;
            windows: DataViewWindow[];
            allData: boolean;
        };
    };
    insights: string[];
    elements: CapturedElementQuery[];
    displayForms: IAttributeDisplayFormMetadataObject[];
};

export const emptyCapturedData: CapturedData = {
    dashboards: [],
    executions: {},
    insights: [],
    elements: [],
    displayForms: [],
};

export function initializeCapturedData() {
    window["CapturedData"] = emptyCapturedData;
}

export function getCapturedData(): CapturedData {
    return window["CapturedData"];
}

export function captureDashboard(identifier: string) {
    getCapturedData().dashboards.push(identifier);
}

export function captureDisplayForm(displayForm: IAttributeDisplayFormMetadataObject) {
    getCapturedData().displayForms.push(displayForm);
}

export function captureExecutionDefinition(executionDefinition: IExecutionDefinition, executionId: string) {
    const capturedExecution = getCapturedData().executions[executionId];
    if (!capturedExecution) {
        getCapturedData().executions[executionId] = {
            definition: executionDefinition,
            allData: false,
            windows: [],
        };
    }
}

export function captureExecutionDefinitionWindow(offset: number[], size: number[], executionId: string) {
    getCapturedData().executions[executionId].windows.push({ offset, size });
}

export function captureExecutionDefinitionReadAll(executionId: string) {
    getCapturedData().executions[executionId].allData = true;
}

export function captureInsight(identifier: string) {
    getCapturedData().insights.push(identifier);
}

export function captureElementsQuery(query: CapturedElementQuery) {
    getCapturedData().elements.push(query);
}
