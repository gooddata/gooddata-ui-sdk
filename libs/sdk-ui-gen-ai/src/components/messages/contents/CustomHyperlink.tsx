// (C) 2025 GoodData Corporation

import * as React from "react";
import { useConfig } from "../../ConfigContext.js";

export type CustomHyperlinkProps = {
    href: string;
    text: string;
};

/**
 * Similar to SDK Hyperlink, but can handle customer schemas
 * used for links management
 */
export const CustomHyperlink: React.FC<CustomHyperlinkProps> = ({ href, text }) => {
    const { linkHandler, allowNativeLinks } = useConfig();
    const parsedRef = React.useMemo(() => {
        if (!href) {
            return null;
        }

        const url = new URL(href);

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

    const handleLinkClick = (e: React.MouseEvent) => {
        if (!linkHandler) {
            return;
        }

        return linkHandler({
            type: parsedRef.type,
            id: parsedRef.id,
            workspaceId: parsedRef.workspaceId,
            itemUrl: parsedRef.itemUrl,
            newTab: e.metaKey,
            preventDefault: e.preventDefault.bind(e),
        });
    };

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
};

const getItemUrl = (workspaceId: string, id: string, objectType: string) => {
    switch (objectType) {
        case "visualization":
            return `/analyze/#/${workspaceId}/${id}/edit`;
        case "dashboard":
            return `/dashboards/#/workspace/${workspaceId}/dashboard/${id}`;
        case "metric":
            return `/metrics/#/${workspaceId}/metric/${id}`;
        default:
            return null;
    }
};
