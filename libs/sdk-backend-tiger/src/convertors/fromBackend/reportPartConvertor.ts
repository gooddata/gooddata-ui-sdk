// (C) 2026 GoodData Corporation

import { type AiReportPart } from "@gooddata/api-client-tiger";
import { type IChatConversationReportContent } from "@gooddata/sdk-backend-spi";
import { type AacReport, yamlReportToDefinition } from "@gooddata/sdk-code-convertors";
import { type IReportDefinition, isIdentifierRef } from "@gooddata/sdk-model";

type ReportFormatConvertor = (report: AacReport) => IReportDefinition;

const DEFAULT_REPORT_FORMAT = "aac-v1";

// The backend can name a format this client was not generated for, so the name is read as text.
const REPORT_FORMAT_CONVERTORS = new Map<string, ReportFormatConvertor>([
    [DEFAULT_REPORT_FORMAT, yamlReportToDefinition],
]);

// The convertor throws on a document it cannot read, so this only has to tell a report from any other
// value; what is inside is the convertor's to reject.
function isAacReport(value: unknown): value is AacReport {
    return typeof value === "object" && value !== null && "type" in value && value.type === "report";
}

const isText = (value: unknown): value is string => typeof value === "string";

const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);

const isTextMap = (value: unknown): value is Record<string, string> =>
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isText);

// The format convertors copy the fields across as written. Without a text title and period the report
// cannot be shown, so a wrong type rejects it.
const hasTypedRequiredFields = ({ title, periodStart, periodEnd }: IReportDefinition) =>
    [title, periodStart, periodEnd].every(isText);

// An optional field of the wrong type would reach the caller typed as the right one.
// Dropping it keeps the rest of the report readable.
function withTypedOptionalFields(definition: IReportDefinition): IReportDefinition {
    const { description, tags, variableValues, ref, ...required } = definition;
    return {
        ...required,
        ...(isText(description) ? { description } : {}),
        ...(isTextList(tags) ? { tags } : {}),
        ...(isTextMap(variableValues) ? { variableValues } : {}),
        ...(isIdentifierRef(ref) && isText(ref.identifier) ? { ref } : {}),
    };
}

function convertReport(report: object, format: string): IReportDefinition | null {
    const convertor = REPORT_FORMAT_CONVERTORS.get(format);
    if (!convertor) {
        console.error(`Unknown report format "${format}".`);
        return null;
    }
    if (!isAacReport(report)) {
        console.error("The report part does not carry a report document.");
        return null;
    }
    try {
        const definition = convertor(report);
        if (!hasTypedRequiredFields(definition)) {
            console.error("The report's title or period is not text.");
            return null;
        }
        return withTypedOptionalFields(definition);
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Converts a report part. A report that cannot be read still yields a part, with `report` null, so the
 * chat can say the report is unavailable instead of dropping it.
 */
export function convertReportPart(part: AiReportPart): IChatConversationReportContent {
    return {
        type: "report",
        report: part.report ? convertReport(part.report, part.format ?? DEFAULT_REPORT_FORMAT) : null,
        saved: part.saved_report_id,
        ref: part.report_ref,
        baseReportId: part.base_report_id,
        refines: part.refines_ref,
        ...(part.reworks_open_report ? { reworksOpenReport: true } : {}),
    };
}
