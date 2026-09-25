// (C) 2026 GoodData Corporation

import { type DeclarativeReport, type DeclarativeReportPageLayout } from "@gooddata/api-client-tiger";
import type {
    Report,
    ReportPageBody,
    ReportPageLayout,
    ReportTemplate,
    ReportVariable,
} from "@gooddata/sdk-code-schemas/v1";
import {
    type IReportContent,
    type IReportDefinition,
    type IReportPageLayoutDefinition,
    type IReportTemplateDefinition,
    type IReportVariableDefinition,
    type ReportDateString,
    idRef,
} from "@gooddata/sdk-model";

import { type IErrorContext } from "../utils/errors.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

import {
    filtersToDeclarative,
    yamlReportPageBodyToDeclarative,
    yamlReportPageToDeclarative,
} from "./yamlReportPageToDeclarative.js";

function variablesToDeclarative(
    variables: ReportVariable[] | undefined,
): IReportVariableDefinition[] | undefined {
    return variables?.map((variable) => ({
        name: variable.name,
        ...(variable.title === undefined ? {} : { title: variable.title }),
        ...(variable.description === undefined ? {} : { description: variable.description }),
        ...(variable.default === undefined ? {} : { defaultValue: variable.default }),
    }));
}

function contentToDeclarative(
    pages: ReportPageBody[] | undefined,
    filters: Report["filters"],
    variables: ReportVariable[] | undefined,
    errorContext?: IErrorContext,
): IReportContent {
    // The stored content states its own version; a document states the schema's instead, so the
    // convertor is what knows which shape it just wrote.
    const declared = filtersToDeclarative(filters);
    const declaredVariables = variablesToDeclarative(variables);

    return {
        version: "1",
        pages: pages?.map((body) => yamlReportPageToDeclarative(body, errorContext)) ?? [],
        ...(declared === undefined ? {} : { filters: declared }),
        ...(declaredVariables === undefined ? {} : { variables: declaredVariables }),
    };
}

/**
 * Named for the document it reads, because a visualisation's query convertor already owns the
 * shorter name.
 *
 * @alpha
 */
export function yamlReportDocumentToDeclarative(
    input: Report,
    errorContext?: IErrorContext,
): DeclarativeReport {
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        description: input.description ?? "",
        tags: input.tags ?? [],
        periodStart: input.period.start,
        periodEnd: input.period.end,
        ...(input.variable_values === undefined ? {} : { variableValues: input.variable_values }),
        content: contentToDeclarative(input.pages, input.filters, input.variables, errorContext),
    };
}

/**
 * The same report, as the frontend holds it: an object reference in place of the bare id the
 * document names it by.
 *
 * @alpha
 */
export function yamlReportToDefinition(input: Report, errorContext?: IErrorContext): IReportDefinition {
    return {
        type: "report",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        periodStart: input.period.start as ReportDateString,
        periodEnd: input.period.end as ReportDateString,
        ...(input.variable_values === undefined ? {} : { variableValues: input.variable_values }),
        content: contentToDeclarative(input.pages, input.filters, input.variables, errorContext),
    };
}

/** @alpha */
export function yamlReportTemplateToDefinition(
    input: ReportTemplate,
    errorContext?: IErrorContext,
): IReportTemplateDefinition {
    return {
        type: "reportTemplate",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        content: contentToDeclarative(input.pages, input.filters, input.variables, errorContext),
    };
}

/** @alpha */
export function yamlReportPageLayoutToDefinition(
    input: ReportPageLayout,
    errorContext?: IErrorContext,
): IReportPageLayoutDefinition {
    return {
        type: "reportPageLayout",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        content: {
            version: "1",
            ...yamlReportPageBodyToDeclarative(input, errorContext),
        },
    };
}

/** @alpha */
export function yamlReportPageLayoutToDeclarative(
    input: ReportPageLayout,
    errorContext?: IErrorContext,
): DeclarativeReportPageLayout {
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        description: input.description ?? "",
        tags: input.tags ?? [],
        content: {
            version: "1",
            ...yamlReportPageBodyToDeclarative(input, errorContext),
        },
    };
}
