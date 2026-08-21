// (C) 2026 GoodData Corporation

const ACTIVE_APP_ATTRIBUTE = "data-activeApp";

export function setActiveAppAttribute(appId: string | undefined): void {
    if (appId) {
        document.documentElement.setAttribute(ACTIVE_APP_ATTRIBUTE, appId);
    } else {
        document.documentElement.removeAttribute(ACTIVE_APP_ATTRIBUTE);
    }
}
