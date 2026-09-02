// (C) 2026 GoodData Corporation

import {
    type JsonApiReportInAttributes,
    type JsonApiReportPageLayoutInAttributes,
    type JsonApiReportTemplateInAttributes,
} from "@gooddata/api-client-tiger";
import {
    type IReportDefinition,
    type IReportPageLayoutDefinition,
    type IReportTemplateDefinition,
} from "@gooddata/sdk-model";

export function convertReportPageLayoutToBackend(
    layout: IReportPageLayoutDefinition,
): JsonApiReportPageLayoutInAttributes {
    return {
        title: layout.title,
        description: layout.description,
        tags: layout.tags,
        content: layout.content,
    };
}

export function convertReportTemplateToBackend(
    template: IReportTemplateDefinition,
): JsonApiReportTemplateInAttributes {
    return {
        title: template.title,
        description: template.description,
        tags: template.tags,
        content: template.content,
    };
}

export function convertReportToBackend(report: IReportDefinition): JsonApiReportInAttributes {
    return {
        title: report.title,
        description: report.description,
        tags: report.tags,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        content: report.content,
        variableValues: report.variableValues,
    };
}
