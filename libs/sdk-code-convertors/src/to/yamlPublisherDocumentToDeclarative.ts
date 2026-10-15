// (C) 2026 GoodData Corporation

import { type DeclarativeReport, type DeclarativeReportPageLayout } from "@gooddata/api-client-tiger";
import type { Report, ReportPageLayout, ReportTemplate, ReportVariable } from "@gooddata/sdk-code-schemas/v1";
import {
    type IPublisherDocumentContentV1,
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherPageTemplateDefinitionV1,
    type IPublisherVariableDefinitionV1,
    type PublisherDateStringV1,
    idRef,
} from "@gooddata/sdk-model";

import { type IErrorContext } from "../utils/errors.js";
import { filtersToDeclarative } from "../utils/publisherFilters.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

import {
    yamlPublisherDocumentPageToDeclarative,
    yamlPublisherPageBodyToDeclarative,
} from "./yamlPublisherDocumentPageToDeclarative.js";

function variablesToDeclarative(
    variables: ReportVariable[] | undefined,
): IPublisherVariableDefinitionV1[] | undefined {
    return variables?.map((variable) => ({
        name: variable.name,
        ...(variable.title === undefined ? {} : { title: variable.title }),
        ...(variable.description === undefined ? {} : { description: variable.description }),
        ...(variable.default === undefined ? {} : { defaultValue: variable.default }),
    }));
}

// A document and a template state the same content; only what surrounds it differs.
type PublisherContentDocument = Pick<Report, "pages" | "filters" | "variables" | "takeaways_instruction">;

function contentToDeclarative(
    document: PublisherContentDocument,
    errorContext?: IErrorContext,
): IPublisherDocumentContentV1 {
    // The stored content states its own version; a document states the schema's instead, so the
    // convertor is what knows which shape it just wrote.
    const declared = filtersToDeclarative(document.filters);
    const declaredVariables = variablesToDeclarative(document.variables);

    return {
        version: "1",
        pages:
            document.pages?.map((body) => yamlPublisherDocumentPageToDeclarative(body, errorContext)) ?? [],
        ...(declared === undefined ? {} : { filters: declared }),
        ...(declaredVariables === undefined ? {} : { variables: declaredVariables }),
        ...(document.takeaways_instruction === undefined
            ? {}
            : { takeawaysInstruction: document.takeaways_instruction }),
    };
}

/**
 * Named for the document it reads, because a visualisation's query convertor already owns the
 * shorter name.
 *
 * @alpha
 */
export function yamlPublisherDocumentToDeclarative(
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
        content: contentToDeclarative(input, errorContext),
    };
}

/**
 * The same document, as the frontend holds it: an object reference in place of the bare id the
 * YAML names it by.
 *
 * @alpha
 */
export function yamlPublisherDocumentToDefinition(
    input: Report,
    errorContext?: IErrorContext,
): IPublisherDocumentDefinitionV1 {
    return {
        type: "report",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        periodStart: input.period.start as PublisherDateStringV1,
        periodEnd: input.period.end as PublisherDateStringV1,
        ...(input.variable_values === undefined ? {} : { variableValues: input.variable_values }),
        content: contentToDeclarative(input, errorContext),
    };
}

/** @alpha */
export function yamlPublisherDocumentTemplateToDefinition(
    input: ReportTemplate,
    errorContext?: IErrorContext,
): IPublisherDocumentTemplateDefinitionV1 {
    return {
        type: "reportTemplate",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        content: contentToDeclarative(input, errorContext),
    };
}

/** @alpha */
export function yamlPublisherPageLayoutToDefinition(
    input: ReportPageLayout,
    errorContext?: IErrorContext,
): IPublisherPageTemplateDefinitionV1 {
    return {
        type: "reportPageLayout",
        ...(input.id === undefined ? {} : { ref: idRef(input.id) }),
        title: input.title ?? convertIdToTitle(input.id ?? ""),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.tags === undefined ? {} : { tags: input.tags }),
        content: {
            version: "1",
            ...yamlPublisherPageBodyToDeclarative(input, errorContext),
        },
    };
}

/** @alpha */
export function yamlPublisherPageLayoutToDeclarative(
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
            ...yamlPublisherPageBodyToDeclarative(input, errorContext),
        },
    };
}
