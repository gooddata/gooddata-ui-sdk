// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type GenAIObjectReferenceType, type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { REFERENCE_REGEX } from "./components/completion/references.js";
import { type IChatConversationLocal } from "./model.js";
import { type IGenAIContextObject } from "./types.js";

export function getVisualizationHref(wsId: string, visId: string, useHostedAnalyticalDesigner?: boolean) {
    return useHostedAnalyticalDesigner
        ? `/workspace/${wsId}/analyze/#/${visId}/edit`
        : `/analyze/#/${wsId}/${visId}/edit`;
}

export function getAbsoluteVisualizationHref(
    wsId: string,
    visId: string,
    useHostedAnalyticalDesigner?: boolean,
) {
    return `${window.location.origin}${getVisualizationHref(wsId, visId, useHostedAnalyticalDesigner)}`;
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
        case "attribute":
            return "ATTRIBUTE";
        case "dashboard":
            return "DASHBOARD";
        default:
            return "DASHBOARD";
    }
}
