// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useMemo } from "react";

import { useSelector } from "react-redux";

import { type IChatConversationLocal } from "../../../model.js";
import { conversationSelector } from "../../../store/messages/messagesSelectors.js";
import { getPublisherDocumentHref } from "../../../utils.js";
import { type LinkHandlerEvent, useConfig } from "../../ConfigContext.js";

export type CustomHyperlinkOwnProps = {
    href: string;
    text: ReactNode;
};

type CustomHyperlinkProps = CustomHyperlinkOwnProps & {
    conversation?: IChatConversationLocal;
};

/**
 * Similar to SDK Hyperlink, but can handle customer schemas
 * used for links management
 */
export function CustomHyperlinkComponent({ href, text, conversation }: CustomHyperlinkProps) {
    const { linkHandler, allowNativeLinks, canManage, canAnalyze, canCreateDocument } = useConfig();
    const canManageMetrics = canManage || canAnalyze;
    const canManageVisualisations = canManage || canAnalyze;

    const parsedRef = useMemo(() => {
        if (!href) {
            return null;
        }

        let url;
        try {
            const decodedHref = decodeURIComponent(href);
            url = new URL(decodedHref);
        } catch {
            return null;
        }

        if (url.protocol !== "gooddata:") {
            return null;
        }

        const workspaceId = url.searchParams.get("ws");
        const id = url.searchParams.get("id");
        const type = url.hostname;

        if (!workspaceId || !id) {
            return null;
        }

        const itemUrl = getItemUrl(workspaceId, id, type);

        if (!itemUrl) {
            return null;
        }

        return {
            type,
            workspaceId,
            id,
            itemUrl,
        };
    }, [href]);

    if (!parsedRef) {
        return text;
    }

    const handleLinkClick = (e: MouseEvent) => {
        if (!linkHandler) {
            return;
        }

        return linkHandler({
            type: parsedRef.type as LinkHandlerEvent["type"],
            id: parsedRef.id,
            workspaceId: parsedRef.workspaceId,
            itemUrl: parsedRef.itemUrl,
            newTab: e.metaKey,
            preventDefault: e.preventDefault.bind(e),
            action: "open",
            conversationId: conversation?.localId,
        });
    };

    // If the link is for a metric and the user cannot manage metrics,
    // we do not render the link
    if (parsedRef.type === "metric" && !canManageMetrics) {
        return text;
    }
    // If the link is for a visualization and the user cannot manage visualizations,
    // we do not render the link
    if (parsedRef.type === "visualization" && !canManageVisualisations) {
        return text;
    }
    if (parsedRef.type === "report" && !canCreateDocument) {
        return text;
    }

    if (allowNativeLinks) {
        return (
            <a className="gd-hyperlink" href={parsedRef.itemUrl} onClick={handleLinkClick}>
                <span className="gd-hyperlink-text">{text}</span>
            </a>
        );
    }

    return (
        <span className="gd-hyperlink" onClick={handleLinkClick}>
            <span className="gd-hyperlink-text">{text}</span>
        </span>
    );
}

const getItemUrl = (workspaceId: string, id: string, objectType: string) => {
    switch (objectType) {
        case "visualization":
            return `/workspace/${workspaceId}/analyze/#/${id}/edit`;
        case "dashboard":
            return `/workspace/${workspaceId}/dashboards/#/dashboard/${id}`;
        case "metric":
            return `/workspace/${workspaceId}/metrics/metric/${id}`;
        case "report":
            return getPublisherDocumentHref(workspaceId, id, "aac-v1");
        default:
            return null;
    }
};

export function CustomHyperlink({ href, text }: CustomHyperlinkOwnProps) {
    const conversation = useSelector(conversationSelector);

    return <CustomHyperlinkComponent href={href} text={text} conversation={conversation} />;
}
