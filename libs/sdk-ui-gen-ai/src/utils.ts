// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type GenAIObjectReferenceType,
    type IAttributeOrMeasure,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { REFERENCE_REGEX } from "./components/completion/references.js";
import { type IChatConversationLocal, type IChatConversationLocalItem } from "./model.js";
import { type IGenAIContextListItem, type IGenAIContextObject } from "./types.js";

export function toContextListItem(
    ref: ObjRef,
    title: string,
    visualizationUrl?: string,
): IGenAIContextListItem {
    return {
        id: isIdentifierRef(ref) ? ref.identifier : ref.uri,
        ref,
        title,
        ...(visualizationUrl ? { visualizationUrl } : {}),
    };
}

export function getVisualizationHref(wsId: string, visId: string, status: "draft" | "saved") {
    if (status === "draft") {
        return `/workspace/${wsId}/analyze/?aibuilder=${visId}`;
    }
    return `/workspace/${wsId}/analyze/#/${visId}/edit`;
}

export function getDashboardHref(
    wsId: string,
    dasId: string,
    status: "draft" | "saved",
    useHostedDashboards?: boolean,
) {
    if (status === "draft") {
        return useHostedDashboards
            ? `/workspace/${wsId}/dashboards/#/new-dashboard/?aibuilder=${dasId}`
            : `/dashboards/#/workspace/${wsId}/new-dashboard/?aibuilder=${dasId}`;
    }
    return useHostedDashboards
        ? `/workspace/${wsId}/dashboards/#/dashboard/${dasId}/tab/defaultTabId`
        : `/dashboards/#/workspace/${wsId}/${dasId}/tab/defaultTabId`;
}

// Encoded like the Publisher app's own route builder, so an id with a slash stays one segment.
export function getReportHref(wsId: string, reportId: string) {
    return `/workspace/${wsId}/publisher/report/${encodeURIComponent(reportId)}`;
}

function getReportDraftParams(conversationId: string, itemId: string) {
    // The parameter names are what the reports app reads the draft back by.
    return new URLSearchParams({ conversation: conversationId, item: itemId }).toString();
}

export function getReportDraftHref(wsId: string, conversationId: string, itemId: string) {
    return `/workspace/${wsId}/publisher/new?${getReportDraftParams(conversationId, itemId)}`;
}

export function getReportModifyHref({
    workspaceId,
    reportId,
    conversationId,
    itemId,
}: {
    workspaceId: string;
    reportId: string;
    conversationId: string;
    itemId: string;
}) {
    return `${getReportHref(workspaceId, reportId)}?${getReportDraftParams(conversationId, itemId)}`;
}

export function getReportItemUrl({
    workspaceId,
    saved,
    baseReportId,
    conversationId,
    itemId,
}: {
    workspaceId: string;
    saved?: string | null;
    baseReportId?: string | null;
    conversationId?: string;
    itemId?: string;
}) {
    if (!conversationId || !itemId) {
        return saved ? getReportHref(workspaceId, saved) : undefined;
    }
    const reportId = saved || baseReportId;
    return reportId
        ? getReportModifyHref({ workspaceId, reportId, conversationId, itemId })
        : getReportDraftHref(workspaceId, conversationId, itemId);
}

export function formatReportPeriod(
    periodStart: string,
    periodEnd: string,
    intl: IntlShape,
): string | undefined {
    // A date-only string parses as UTC midnight, which shows as the day before west of Greenwich.
    const start = new Date(`${periodStart}T00:00:00`);
    const end = new Date(`${periodEnd}T00:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return undefined;
    }
    return intl.formatDateTimeRange(start, end, { dateStyle: "medium" });
}

export function getAbsoluteVisualizationHref(wsId: string, visId: string, status: "draft" | "saved") {
    return `${window.location.origin}${getVisualizationHref(wsId, visId, status)}`;
}

export function getSettingHref(section: string, action?: string) {
    if (!action) {
        return `/ai-hub#/${section}`;
    }
    return `/ai-hub#/${section}/${action}`;
}

export function getAbsoluteSettingHref(section: string, action?: string) {
    return `${window.location.origin}${getSettingHref(section, action)}`;
}

export function getWorkspaceSettingHref(workspaceId: string, section: string, action?: string) {
    if (!action) {
        return `/workspaces/${workspaceId}/settings/#/${section}`;
    }
    return `/workspaces/${workspaceId}/settings/#/${section}/${action}`;
}

export function getAbsoluteWorkspaceSettingHref(workspaceId: string, section: string, action?: string) {
    return `${window.location.origin}${getWorkspaceSettingHref(workspaceId, section, action)}`;
}

// Shell-host route shape: the host serves the home-ui module under
// `/organization/settings`, and uses `configuration` (not `settings`) for the
// workspace detail route. Used when `enableShellApplication` is on, so
// standalone `/settings`/`/workspaces/{id}/settings` URLs aren't bounced to the
// workspaces list.
export function getShellAppOrgSettingHref(section: string, action?: string) {
    if (!action) {
        return `/organization/settings/ai-hub#/${section}`;
    }
    return `/organization/settings/ai-hub#/${section}/${action}`;
}

export function getAbsoluteShellAppOrgSettingHref(section: string, action?: string) {
    return `${window.location.origin}${getShellAppOrgSettingHref(section, action)}`;
}

export function getShellAppWorkspaceSettingHref(workspaceId: string, section: string, action?: string) {
    if (!action) {
        return `/organization/settings/workspaces/${workspaceId}/configuration#/${section}`;
    }
    return `/organization/settings/workspaces/${workspaceId}/configuration#/${section}/${action}`;
}

export function getAbsoluteShellAppWorkspaceSettingHref(
    workspaceId: string,
    section: string,
    action?: string,
) {
    return `${window.location.origin}${getShellAppWorkspaceSettingHref(workspaceId, section, action)}`;
}

export function getHeadlineComparison(metrics: IAttributeOrMeasure[]) {
    return {
        comparison: {
            enabled: metrics.filter(Boolean).length > 1,
        },
    };
}

export function generateTemporaryTitle(intl: IntlShape, data: IChatConversationLocal): string {
    return intl.formatMessage(
        { id: "gd.chat.conversation.generating-title" },
        {
            date: new Intl.DateTimeFormat(intl.locale, { dateStyle: "short", timeStyle: "short" }).format(
                new Date(data.createdAt),
            ),
        },
    );
}

export function generateTitleFromQuestion(text: string): string {
    const maxTitleLength = 50;
    const sanitizedText = text
        .replace(/[\u007F-\u009F\u200B-\u200D\u2060\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (sanitizedText.length <= maxTitleLength) {
        return sanitizedText;
    }

    let sliceEnd = maxTitleLength;
    const slicedText = sanitizedText.slice(0, sliceEnd);
    const lastOpeningBrace = slicedText.lastIndexOf("{");
    const lastClosingBrace = slicedText.lastIndexOf("}");

    if (lastOpeningBrace > lastClosingBrace) {
        const referenceStart = sanitizedText.slice(lastOpeningBrace);
        REFERENCE_REGEX.lastIndex = 0;
        const referenceMatch = REFERENCE_REGEX.exec(referenceStart);

        if (referenceMatch?.index === 0) {
            sliceEnd = lastOpeningBrace + referenceMatch[0].length;
        } else {
            const closingBrace = sanitizedText.indexOf("}", sliceEnd);
            if (closingBrace !== -1) {
                sliceEnd = closingBrace + 1;
            }
        }
    }

    return `${sanitizedText.slice(0, sliceEnd).trim()}...`;
}

export function convertReferenceTypeToGenAiType(type: GenAIObjectReferenceType): IGenAIContextObject["type"] {
    switch (type) {
        case "METRIC":
            return "metric";
        case "WIDGET":
            return "widget";
        case "ATTRIBUTE":
            return "attribute";
        case "DASHBOARD":
            return "dashboard";
        default:
            return "dashboard";
    }
}

export function convertGenAiTypeToReferenceType(type: IGenAIContextObject["type"]): GenAIObjectReferenceType {
    switch (type) {
        case "metric":
            return "METRIC";
        case "widget":
            return "WIDGET";
        case "visualization":
            return "WIDGET";
        case "attribute":
            return "ATTRIBUTE";
        case "dashboard":
            return "DASHBOARD";
        default:
            return "DASHBOARD";
    }
}

export function isClarificationQuestionsItem(item: IChatConversationLocalItem | undefined) {
    return (
        item?.content?.type === "multipart" &&
        item.content.parts[item.content.parts.length - 1]?.type === "clarifyingQuestions"
    );
}
