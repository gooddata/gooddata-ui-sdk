// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { REFERENCE_REGEX } from "./components/completion/references.js";
import { type IChatConversationLocal } from "./model.js";

export function getVisualizationHref(wsId: string, visId: string) {
    return `/analyze/#/${wsId}/${visId}/edit`;
}

export function getAbsoluteVisualizationHref(wsId: string, visId: string) {
    return `${window.location.origin}${getVisualizationHref(wsId, visId)}`;
}

export function getSettingHref(section: string, action?: string) {
    if (!action) {
        return `/settings/#/${section}`;
    }
    return `/settings/#/${section}/${action}`;
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
        return `/organization/settings/configuration#/${section}`;
    }
    return `/organization/settings/configuration#/${section}/${action}`;
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
