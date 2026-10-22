// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import { type IUser, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { type IHeaderMenuItem } from "@gooddata/sdk-ui-kit";

import { getActiveInternalApplication, getApplicationHref } from "../loader/routing.js";

/**
 * Builds the display name shown for the current user in the host header.
 *
 * Falls back to `firstName + lastName` when `fullName` is missing, and finally
 * to `login` when neither piece of name metadata is available.
 */
export function getUserDisplayName(user: IUser): string {
    if (user.fullName) {
        return user.fullName;
    }
    const parts = [user.firstName, user.lastName].filter((v): v is string => Boolean(v));
    if (parts.length > 0) {
        return parts.join(" ");
    }
    return user.login;
}

/**
 * Returns the supplied pathname with the `/workspace/{id}` segment swapped for the
 * given `newWorkspaceId`.
 *
 * Falls back to a bare `/workspace/{newWorkspaceId}` if the current pathname does
 * not match the host's `/workspace/*` shape (e.g. when the user is currently on
 * an organization-scoped route).
 */
export function swapWorkspaceInPath(pathname: string, newWorkspaceId: string): string {
    const replaced = pathname.replace(/^\/workspace\/[^/]+/, `/workspace/${newWorkspaceId}`);
    return replaced === pathname ? `/workspace/${newWorkspaceId}` : replaced;
}

/**
 * Returns the path a workspace switch made from `pathname` should land on: the active
 * application's landing route in the new workspace.
 *
 * @remarks
 * The whole in-app remainder of the path is dropped, screens as well as object ids. The host
 * cannot tell them apart — it knows an application only by its route base — and a remainder
 * kept across the switch carries ids of objects that exist in the old workspace only, which
 * lands the user on a "not found" page. A path no workspace-scoped application claims keeps
 * the plain workspace swap.
 */
export function getWorkspaceSwitchPath(
    pathname: string,
    newWorkspaceId: string,
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
): string {
    const activeApp = getActiveInternalApplication(apps, ctx, pathname);
    if (activeApp?.applicationScope === "workspace") {
        return getApplicationHref(activeApp, { ...ctx, currentWorkspaceId: newWorkspaceId });
    }
    return swapWorkspaceInPath(pathname, newWorkspaceId);
}

/**
 * Whether a click carries a modifier key or comes from a non-primary button. The browser has its
 * own meaning for such a click on a link (new tab, new window, download), which a handler must
 * not take over.
 */
export function isModifiedClick(event: MouseEvent<Element>): boolean {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * Whether a click on a link may be taken over with `preventDefault`, rather than left to the
 * browser's own handling of the href.
 *
 * @remarks
 * Keyboard activation of a focused link reports button 0, so it counts as a plain left click.
 */
export function isPlainLeftClick(event: MouseEvent<Element>): boolean {
    return !event.defaultPrevented && !isModifiedClick(event);
}

/**
 * Whether a header menu item click is left to the browser: a modified click on an item with an
 * href opens it natively, so the host must neither prevent it nor navigate the current tab.
 *
 * @remarks
 * Keyboard activation and items without an href keep the host's own handling. `defaultPrevented`
 * is deliberately not consulted, so an upstream `preventDefault` cannot switch navigation off.
 */
export function isBrowserHandledMenuClick(
    item: IHeaderMenuItem,
    event: MouseEvent<Element> | KeyboardEvent<Element> | undefined,
): boolean {
    return Boolean(item.href) && event !== undefined && "button" in event && isModifiedClick(event);
}
