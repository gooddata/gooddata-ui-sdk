// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import {
    type ILocale,
    type PluggableApplicationRegistryItem,
    isExternalPluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { DefaultApplicationId, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { type IHeaderMenuItem } from "@gooddata/sdk-ui-kit";

import { getApplicationHref, isInternalAppRouteActive } from "../loader/routing.js";

function handleExternalAppClick(href: string) {
    return (event: MouseEvent) => {
        // Let the browser handle modifier-click and non-primary buttons natively
        // (opens in a new tab/window). Only intercept a plain left-click so we can
        // suppress the parent menu's SPA navigation and do a full-page load instead —
        // external apps live outside the host SPA, so React Router can't reach them.
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }
        event.preventDefault();
        window.location.assign(href);
    };
}

/**
 * Prefix used for menu item intl message keys to avoid clashes with existing message IDs.
 */
const NAV_MSG_PREFIX = "shellApplication.menuItem.";

function navMessageKey(appId: string): string {
    return `${NAV_MSG_PREFIX}${appId}`;
}

export function getLocalizedTitle(
    app: PluggableApplicationRegistryItem,
    locale: ILocale | undefined,
): string {
    if (locale && app.localizedTitle) {
        const localizedTitle = app.localizedTitle[locale];
        if (localizedTitle) {
            return localizedTitle;
        }
    }
    return app.title;
}

export interface IAppMenuResult {
    menuItemsGroups: IHeaderMenuItem[][];
    messages: Record<string, string>;
}

// When `gdc-home-ui` is the only organization-scoped app, it is reachable via the logo
// and would otherwise appear as a redundant standalone "Organization" menu entry. We must
// have this shifty logic in place to emulate the old behavior of Panther Home UI app.
function filterDefaultOrganizationApp(
    apps: PluggableApplicationRegistryItem[],
): PluggableApplicationRegistryItem[] {
    const organizationApps = apps.filter((app) => app.applicationScope === "organization");
    if (organizationApps.length === 1 && organizationApps[0].id === DefaultApplicationId.HOME_UI) {
        return apps.filter((app) => app.id !== DefaultApplicationId.HOME_UI);
    }
    return apps;
}

/**
 * Builds header menu item groups and the corresponding intl messages for app titles.
 *
 * Each app gets a namespaced message key (`shellApplication.menuItem.<appId>`) so that the localized
 * title is available to `FormattedMessage` without risking key clashes in the message bundle.
 *
 * Uses `getApplicationHref` / `isInternalAppRouteActive` from routing.ts for proper
 * workspace/organization-scoped URLs and active state detection.
 */
export function buildAppMenu(
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
    locale: ILocale | undefined,
): IAppMenuResult {
    if (apps.length === 0) {
        return { menuItemsGroups: [], messages: {} };
    }

    const visibleApps = filterDefaultOrganizationApp(apps);
    if (visibleApps.length === 0) {
        return { menuItemsGroups: [], messages: {} };
    }

    const messages: Record<string, string> = {};
    const items: IHeaderMenuItem[] = visibleApps.map((app) => {
        const isExternal = isExternalPluggableApplicationRegistryItem(app);
        const href = getApplicationHref(app, ctx, pathname);
        const isActive = !isExternal && isInternalAppRouteActive(app, ctx, pathname);
        const key = navMessageKey(app.id);

        messages[key] = getLocalizedTitle(app, locale);

        return {
            key,
            href,
            isActive,
            onClick: isExternal ? handleExternalAppClick(href) : undefined,
        };
    });

    return { menuItemsGroups: [items], messages };
}
