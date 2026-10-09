// (C) 2026 GoodData Corporation

import { Document, Scalar, YAMLSeq } from "yaml";

import { type DeclarativeReport, type DeclarativeReportPageLayout } from "@gooddata/api-client-tiger";
import type { Report, ReportPageBody, ReportPageLayout, ReportTemplate } from "@gooddata/sdk-code-schemas/v1";
import {
    type IPublisherDocumentContent,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentPage,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayout,
    type IPublisherPageLayoutContent,
    type IPublisherPageLayoutDefinition,
    type IPublisherVariableDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    PUBLISHER_DOCUMENT_COMMENT,
    PUBLISHER_DOCUMENT_TEMPLATE_COMMENT,
    PUBLISHER_PAGE_LAYOUT_COMMENT,
} from "../utils/texts.js";

import {
    declarativePublisherDocumentPageToYaml,
    filtersToYaml,
    mapOf,
    publisherPageBodyEntries,
} from "./declarativePublisherDocumentPageToYaml.js";

/**
 * A date is quoted, so a reader whose YAML dialect knows timestamps hands back the string the
 * schema states rather than a date of its own making.
 */
function quotedDate(value: string | undefined): Scalar | undefined {
    if (value === undefined) {
        return undefined;
    }
    const scalar = new Scalar(value);
    scalar.type = Scalar.QUOTE_DOUBLE;
    return scalar;
}

function variablesToYaml(variables: IPublisherVariableDefinition[] | undefined): YAMLSeq | undefined {
    if (!variables?.length) {
        return undefined;
    }
    const seq = new YAMLSeq();
    for (const variable of variables) {
        seq.add(
            mapOf([
                ["name", variable.name],
                ["title", variable.title],
                ["description", variable.description],
                ["default", variable.defaultValue],
            ]),
        );
    }
    return seq;
}

function pagesToYaml(content: IPublisherDocumentContent): YAMLSeq {
    const seq = new YAMLSeq();
    for (const page of content.pages) {
        seq.add(declarativePublisherDocumentPageToYaml(page));
    }
    return seq;
}

function bodyEntries(content: IPublisherDocumentContent): Array<[string, unknown]> {
    return [
        ["pages", pagesToYaml(content)],
        ["filters", filtersToYaml(content.filters)],
        ["variables", variablesToYaml(content.variables)],
        ["takeaways_instruction", content.takeawaysInstruction || undefined],
    ];
}

function toDocument<TDocument>(
    entries: Array<[string, unknown]>,
    comment: string = PUBLISHER_DOCUMENT_COMMENT,
): { content: string; json: TDocument } {
    const doc = new Document(mapOf(entries));
    doc.commentBefore = comment;
    return {
        content: doc.toString({ lineWidth: 0 }),
        json: doc.toJSON() as TDocument,
    };
}

/** @alpha */
export function declarativePublisherDocumentToYaml(publisherDocument: DeclarativeReport): {
    content: string;
    json: Report;
} {
    return toDocument<Report>([
        ["id", publisherDocument.id],
        ["type", "report"],
        ["title", publisherDocument.title],
        ["description", publisherDocument.description || undefined],
        ["tags", publisherDocument.tags?.length ? publisherDocument.tags : undefined],
        [
            "period",
            mapOf([
                ["start", quotedDate(publisherDocument.periodStart)],
                ["end", quotedDate(publisherDocument.periodEnd)],
            ]),
        ],
        ...bodyEntries(publisherDocument.content as IPublisherDocumentContent),
        [
            "variable_values",
            Object.keys(publisherDocument.variableValues ?? {}).length
                ? publisherDocument.variableValues
                : undefined,
        ],
    ]);
}

/**
 * The same document, written from what the frontend holds: the object reference it is identified by
 * becomes the bare id the YAML names it with.
 *
 * @alpha
 */
export function publisherDocumentDefinitionToYaml(publisherDocument: IPublisherDocumentDefinition): {
    content: string;
    json: Report;
} {
    return toDocument<Report>([
        ["id", publisherDocument.ref === undefined ? undefined : objRefToString(publisherDocument.ref)],
        ["type", "report"],
        ["title", publisherDocument.title],
        ["description", publisherDocument.description || undefined],
        ["tags", publisherDocument.tags?.length ? publisherDocument.tags : undefined],
        [
            "period",
            mapOf([
                ["start", quotedDate(publisherDocument.periodStart)],
                ["end", quotedDate(publisherDocument.periodEnd)],
            ]),
        ],
        ...bodyEntries(publisherDocument.content),
        [
            "variable_values",
            Object.keys(publisherDocument.variableValues ?? {}).length
                ? publisherDocument.variableValues
                : undefined,
        ],
    ]);
}

/** @alpha */
export function publisherDocumentTemplateDefinitionToYaml(
    template: IPublisherDocumentTemplate | IPublisherDocumentTemplateDefinition,
): {
    content: string;
    json: ReportTemplate;
} {
    return toDocument<ReportTemplate>(
        [
            ["id", template.ref === undefined ? undefined : objRefToString(template.ref)],
            ["type", "report_template"],
            ["title", template.title],
            ["description", template.description || undefined],
            ["tags", template.tags?.length ? template.tags : undefined],
            ...bodyEntries(template.content),
        ],
        PUBLISHER_DOCUMENT_TEMPLATE_COMMENT,
    );
}

/**
 * A reusable page. Its body is written at the top level, because the object it is already names it -
 * a page written into a document names itself instead.
 *
 * @alpha
 */
export function publisherPageLayoutDefinitionToYaml(
    layout: IPublisherPageLayout | IPublisherPageLayoutDefinition,
): {
    content: string;
    json: ReportPageLayout;
} {
    return toDocument<ReportPageLayout>(
        [
            ["id", layout.ref === undefined ? undefined : objRefToString(layout.ref)],
            ["type", "report_page_layout"],
            ["title", layout.title],
            ["description", layout.description || undefined],
            ["tags", layout.tags?.length ? layout.tags : undefined],
            ...publisherPageBodyEntries(layout.content),
        ],
        PUBLISHER_PAGE_LAYOUT_COMMENT,
    );
}

/** @alpha */
export function declarativePublisherPageLayoutToYaml(layout: DeclarativeReportPageLayout): {
    content: string;
    json: ReportPageLayout;
} {
    return toDocument<ReportPageLayout>(
        [
            ["id", layout.id],
            ["type", "report_page_layout"],
            ["title", layout.title],
            ["description", layout.description || undefined],
            ["tags", layout.tags?.length ? layout.tags : undefined],
            ...publisherPageBodyEntries(layout.content as IPublisherPageLayoutContent),
        ],
        PUBLISHER_PAGE_LAYOUT_COMMENT,
    );
}

/**
 * One page of a document or a template, as the YAML writes it down.
 *
 * @internal
 */
export function publisherDocumentPageToAacPage(page: IPublisherDocumentPage): ReportPageBody {
    return declarativePublisherDocumentPageToYaml(page).toJSON() as ReportPageBody;
}
