// (C) 2007-2025 GoodData Corporation

import { useEffect } from "react";

import { compact } from "lodash-es";

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
export function DocumentHeader({
    pageTitle = "",
    brandTitle = "",
    appleTouchIconUrl = "",
    faviconUrl = "",
}: IDocumentHeaderProps) {
    useEffect(() => {
        if (!document) return;

        document.title = getEffectiveTitle(pageTitle, brandTitle);

        if (appleTouchIconUrl) {
            const linkAppleQuery = document.querySelector("link[rel='apple-touch-icon']");
            const linkApple = (linkAppleQuery || document.createElement("link")) as HTMLLinkElement;
            linkApple.rel = "apple-touch-icon";
            linkApple.type = "image/png";
            linkApple.href = appleTouchIconUrl;
            if (!linkAppleQuery) document.head.appendChild(linkApple);
        }

        if (faviconUrl) {
            const linkFaviconQuery = document.querySelector("link[rel~='icon']");
            const linkFavicon = (linkFaviconQuery || document.createElement("link")) as HTMLLinkElement;
            linkFavicon.rel = "shortcut icon";
            linkFavicon.type = "image/x-icon";
            linkFavicon.href = faviconUrl;
            if (!linkFaviconQuery) document.head.appendChild(linkFavicon);
        }
    }, [pageTitle, brandTitle, appleTouchIconUrl, faviconUrl]);

    return null;
}
