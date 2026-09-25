// (C) 2026 GoodData Corporation

import { Document, Scalar, YAMLSeq } from "yaml";

import { type DeclarativeReport, type DeclarativeReportPageLayout } from "@gooddata/api-client-tiger";
import type { Report, ReportPageBody, ReportPageLayout, ReportTemplate } from "@gooddata/sdk-code-schemas/v1";
import {
    type IReportContent,
    type IReportContentPage,
    type IReportDefinition,
    type IReportPageLayout,
    type IReportPageLayoutContent,
    type IReportPageLayoutDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
    type IReportVariableDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import { REPORT_COMMENT, REPORT_PAGE_LAYOUT_COMMENT, REPORT_TEMPLATE_COMMENT } from "../utils/texts.js";

import {
    declarativeReportPageToYaml,
    filtersToYaml,
    mapOf,
    reportPageBodyEntries,
} from "./declarativeReportPageToYaml.js";

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

function variablesToYaml(variables: IReportVariableDefinition[] | undefined): YAMLSeq | undefined {
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

function pagesToYaml(content: IReportContent): YAMLSeq {
    const seq = new YAMLSeq();
    for (const page of content.pages) {
        seq.add(declarativeReportPageToYaml(page));
    }
    return seq;
}

function bodyEntries(content: IReportContent): Array<[string, unknown]> {
    return [
        ["pages", pagesToYaml(content)],
        ["filters", filtersToYaml(content.filters)],
        ["variables", variablesToYaml(content.variables)],
    ];
}

function toDocument<TDocument>(
    entries: Array<[string, unknown]>,
    comment: string = REPORT_COMMENT,
): { content: string; json: TDocument } {
    const doc = new Document(mapOf(entries));
    doc.commentBefore = comment;
    return {
        content: doc.toString({ lineWidth: 0 }),
        json: doc.toJSON() as TDocument,
    };
}

/** @alpha */
export function declarativeReportToYaml(report: DeclarativeReport): { content: string; json: Report } {
    return toDocument<Report>([
        ["id", report.id],
        ["type", "report"],
        ["title", report.title],
        ["description", report.description || undefined],
        ["tags", report.tags?.length ? report.tags : undefined],
        [
            "period",
            mapOf([
                ["start", quotedDate(report.periodStart)],
                ["end", quotedDate(report.periodEnd)],
            ]),
        ],
        ...bodyEntries(report.content as IReportContent),
        [
            "variable_values",
            Object.keys(report.variableValues ?? {}).length ? report.variableValues : undefined,
        ],
    ]);
}

/**
 * The same report, written from what the frontend holds: the object reference it is identified by
 * becomes the bare id a document names it with.
 *
 * @alpha
 */
export function reportDefinitionToYaml(report: IReportDefinition): { content: string; json: Report } {
    return toDocument<Report>([
        ["id", report.ref === undefined ? undefined : objRefToString(report.ref)],
        ["type", "report"],
        ["title", report.title],
        ["description", report.description || undefined],
        ["tags", report.tags?.length ? report.tags : undefined],
        [
            "period",
            mapOf([
                ["start", quotedDate(report.periodStart)],
                ["end", quotedDate(report.periodEnd)],
            ]),
        ],
        ...bodyEntries(report.content),
        [
            "variable_values",
            Object.keys(report.variableValues ?? {}).length ? report.variableValues : undefined,
        ],
    ]);
}

/** @alpha */
export function reportTemplateDefinitionToYaml(template: IReportTemplate | IReportTemplateDefinition): {
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
        REPORT_TEMPLATE_COMMENT,
    );
}

/**
 * A reusable page. Its body is written at the top level, because the object it is already names it -
 * a page written into a report names itself instead.
 *
 * @alpha
 */
export function reportPageLayoutDefinitionToYaml(layout: IReportPageLayout | IReportPageLayoutDefinition): {
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
            ...reportPageBodyEntries(layout.content),
        ],
        REPORT_PAGE_LAYOUT_COMMENT,
    );
}

/** @alpha */
export function declarativeReportPageLayoutToYaml(layout: DeclarativeReportPageLayout): {
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
            ...reportPageBodyEntries(layout.content as IReportPageLayoutContent),
        ],
        REPORT_PAGE_LAYOUT_COMMENT,
    );
}

/**
 * One page of a report or a template, as a document writes it down.
 *
 * @internal
 */
export function reportPageToAacPage(page: IReportContentPage): ReportPageBody {
    return declarativeReportPageToYaml(page).toJSON() as ReportPageBody;
}
