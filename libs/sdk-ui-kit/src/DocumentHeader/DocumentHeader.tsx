// (C) 2007-2025 GoodData Corporation
import React, { useEffect } from "react";
import compact from "lodash/compact.js";

/**
 * @internal
 */
export interface IDocumentHeaderProps {
    pageTitle?: string;
    brandTitle?: string;
    appleTouchIconUrl?: string;
    faviconUrl?: string;
}

function getEffectiveTitle(pageTitle: string, brandTitle: string): string {
    return compact([pageTitle, brandTitle]).join(" - ");
}

/**
 * @internal
 */
const DocumentHeader: React.FC<IDocumentHeaderProps> = ({
    pageTitle = "",
    brandTitle = "",
    appleTouchIconUrl = "",
    faviconUrl = "",
}) => {
    useEffect(() => {
        if (!document) return;

        document.title = getEffectiveTitle(pageTitle, brandTitle);

        const linkApple = (document.querySelector("link[rel='apple-touch-icon']") ||
            document.createElement("link")) as HTMLLinkElement;
        linkApple.rel = "apple-touch-icon";
        linkApple.type = "image/png";
        linkApple.href = appleTouchIconUrl;
        document.head.appendChild(linkApple);

        const linkFavicon = (document.querySelector("link[rel~='icon']") ||
            document.createElement("link")) as HTMLLinkElement;
        linkFavicon.rel = "shortcut icon";
        linkFavicon.type = "image/x-icon";
        linkFavicon.href = faviconUrl;
        document.head.appendChild(linkFavicon);
    }, [pageTitle, brandTitle, appleTouchIconUrl, faviconUrl]);

    return null;
};

export default DocumentHeader;
