// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IChatConversation } from "@gooddata/sdk-backend-spi";
import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

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

export function getHeadlineComparison(metrics: IAttributeOrMeasure[]) {
    return {
        comparison: {
            enabled: metrics.filter(Boolean).length > 1,
        },
    };
}

export function generateTemporaryTitle(intl: IntlShape, data: IChatConversation): string {
    return intl.formatMessage(
        { id: "gd.chat.conversation.generating-title" },
        {
            date: new Intl.DateTimeFormat(intl.locale, { dateStyle: "short", timeStyle: "short" }).format(
                new Date(data.createdAt),
            ),
        },
    );
}
