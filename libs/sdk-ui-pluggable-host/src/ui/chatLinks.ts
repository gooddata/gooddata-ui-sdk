// (C) 2026 GoodData Corporation

import { type LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";

interface IChatLinkOptions {
    embedded: boolean | undefined;
    onAppLinkClick: ((link: LinkHandlerEvent) => boolean) | undefined;
}

export function handleChatLinkClick(
    link: LinkHandlerEvent,
    { embedded, onAppLinkClick }: IChatLinkOptions,
): string | undefined {
    // A full navigation unloads the app, so the app is asked first: only it can prompt before
    // dropping unsaved work. A new tab leaves the app loaded, so it opens whatever the app did.
    const isHandledByApp = onAppLinkClick?.(link) ?? false;
    if (!embedded && link.action === "open") {
        const currentUrl = window.location.pathname + window.location.hash;
        if (link.newTab) {
            window.open(link.itemUrl, "_blank");
        } else if (!isHandledByApp && currentUrl !== link.itemUrl) {
            window.location.assign(link.itemUrl);
        }
    }

    link.preventDefault();

    return link.itemUrl;
}
