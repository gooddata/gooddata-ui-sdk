// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo } from "react";

import {
    isExternalPluggableApplicationRegistryItem,
    type IGenAIUserContext,
    type IWorkspacePermissions,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IHostUiNotification,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";
import { BackendProvider, resolveLocale } from "@gooddata/sdk-ui";
import { AppHeaderNotifications } from "@gooddata/sdk-ui-application-header";
import {
    AppHeader,
    DocumentHeader,
    type IHeaderMenuItem,
    type IHeaderWorkspace,
    ToastsCenterContextProvider,
    generateHeaderAccountMenuItems,
    generateHeaderStaticHelpMenuItems,
} from "@gooddata/sdk-ui-kit";
import { defaultHeaderTheme } from "@gooddata/sdk-ui-theme-provider";

import defaultLogoUrl from "../assets/logo-white.svg";
import {
    getAppLifecycleCallbacks,
    preloadPluggableApplication,
} from "../loader/pluggableApplicationsLoader.js";
import { getActiveInternalApplication, getApplicationHref } from "../loader/routing.js";
import { getBackend } from "../platformContext/backend.js";

import { buildAppMenu, getLocalizedTitle } from "./appMenuItems.js";
import { getUserDisplayName, swapWorkspaceInPath } from "./chromeHelpers.js";
import { b, e } from "./hostChromeBem.js";
import { HostIntlProvider } from "./HostIntlProvider.js";
import { HostNotificationDispatcher } from "./HostNotificationDispatcher.js";
import { useHostChromeChat } from "./useHostChromeChat.js";
import { useHostChromePricing } from "./useHostChromePricing.js";
import { useHostChromeSearch } from "./useHostChromeSearch.js";
import { useHostChromeWorkspaceFeatures } from "./useHostChromeWorkspaceFeatures.js";
import { AppHeaderWorkspacePicker } from "./WorkspacePicker.js";
import "./HostChrome.scss";
// SDK packages with side-effecting CSS (declared in their own `sideEffects`)
// must be imported explicitly by consumers; tree-shakers won't grab them otherwise.
// sdk-ui-ext is pulled in transitively via AppHeaderNotifications → NotificationsPanel;
// without its CSS the notification bell icon + dropdown render unstyled (invisible).
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";
import "@gooddata/sdk-ui-semantic-search/styles/css/internal.css";

const LOGOUT_MENU_ITEM_KEY = "gs.header.logout";

// The favicon that index.html shipped — resolved to "<cdnurl>/organization/favicon.ico" on the live
// platform, "/favicon.ico" in dev. Captured once at module load, before DocumentHeader can overwrite
// the <link rel="icon">, so the host can restore the organization favicon when no custom white-label
// favicon is configured (see faviconUrl below).
const initialFaviconUrl =
    (typeof document !== "undefined" && document.querySelector("link[rel~='icon']")?.getAttribute("href")) ||
    "/favicon.ico";

/**
 * AI-assistant open/close request pushed from the active pluggable application. `seq` changes on
 * every request so an identical repeat (e.g. "Summarize" clicked again) still re-triggers the host.
 */
export interface IHostChromeAiVisibility {
    kind: "open" | "close";
    question?: string;
    userContext?: IGenAIUserContext;
    seq: number;
}

/**
 * AI-assistant object-search tag scope reported by the active pluggable application.
 */
export interface IHostChromeAiContext {
    includeTags?: string[];
    excludeTags?: string[];
}

export interface IHostChromeProps {
    ctx: IPlatformContext;
    resolvedApplications: PluggableApplicationRegistryItem[];
    pathname: string;
    onNavigate: (url: string) => void;
    onReplace: (url: string) => void;
    headerOptions?: IAppHeaderOptions;
    notification?: IHostUiNotification | null;
    /** Latest AI-assistant open/close request from the active pluggable application. */
    aiVisibility?: IHostChromeAiVisibility | null;
    /** Latest AI-assistant tag scope reported by the active pluggable application. */
    aiContext?: IHostChromeAiContext | null;
    /** Reports the host chat open-state so the runtime can forward it to the active app. */
    onAiAssistantOpenChange?: (open: boolean) => void;
    /**
     * Page-title segment set by the active pluggable application via a document-title-changed
     * event. When omitted, the active application's manifest title is used instead.
     */
    appPageTitle?: string;
    children?: ReactNode;
}

export function HostChrome({
    ctx,
    resolvedApplications,
    pathname,
    onNavigate,
    onReplace: _onReplace,
    headerOptions,
    notification = null,
    aiVisibility = null,
    aiContext = null,
    onAiAssistantOpenChange,
    appPageTitle,
    children,
}: IHostChromeProps) {
    const locale = resolveLocale(ctx.preferredLocale);
    const userName = getUserDisplayName(ctx.user);

    const features = useHostChromeWorkspaceFeatures(resolvedApplications, ctx, pathname);

    const shellTelemetry = useMemo(
        () => getAppLifecycleCallbacks()?.createTelemetryCallbacks?.("host-ui"),
        [],
    );

    const pricing = useHostChromePricing(ctx, locale);
    const chat = useHostChromeChat({ features, ctx, telemetry: shellTelemetry });
    const {
        askAiAssistant: chatAskAiAssistant,
        open: chatOpen,
        close: chatClose,
        setTags: chatSetTags,
        isOpen: chatIsOpen,
    } = chat;

    // Report the host-owned chat open-state outward so the runtime can forward it to the active
    // pluggable application, keeping app-side assistant controls (and their echoed results) aligned
    // with the real state — e.g. the embedded dashboard's toggleAIAssistant result (LX-2544).
    useEffect(() => {
        onAiAssistantOpenChange?.(chatIsOpen);
    }, [chatIsOpen, onAiAssistantOpenChange]);

    // The active pluggable application must not render its own chat dialog on hosted routes — the
    // chrome owns the single chat instance there (LX-2544). It drives that instance through these
    // signals instead: the object-search tag scope of its current view and open/close requests.
    //
    // Effect order matters: the tag-scope effects are declared before the open/ask effect so that,
    // when a tag-scope change and an open/ask request land in the same commit, the host chat is
    // already scoped before the seeded question is sent.

    // Clear any stale tag scope when the active application changes. The newly active app re-reports
    // its own scope (or none) right after it mounts; without this reset, switching from a
    // tag-scoped app to one that reports no scope (e.g. the metric editor) would leak the old scope.
    // Declared before the context effect so that, in the rare commit where both change, the fresh
    // scope wins over the reset.
    const activeAppId = getActiveInternalApplication(resolvedApplications, ctx, pathname)?.id;
    useEffect(() => {
        chatSetTags(undefined, undefined);
    }, [activeAppId, chatSetTags]);

    useEffect(() => {
        chatSetTags(aiContext?.includeTags, aiContext?.excludeTags);
    }, [aiContext, chatSetTags]);

    const aiVisibilitySeq = aiVisibility?.seq;
    useEffect(() => {
        if (!aiVisibility) {
            return;
        }
        if (aiVisibility.kind === "close") {
            chatClose();
        } else if (aiVisibility.question) {
            chatAskAiAssistant(aiVisibility.question, aiVisibility.userContext);
        } else {
            chatOpen();
        }
        // `seq` changes on every request, so a repeated identical open/ask still re-runs this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiVisibilitySeq, chatAskAiAssistant, chatOpen, chatClose]);

    const search = useHostChromeSearch({
        features,
        isTrial: pricing.isTrial,
        onAskAiAssistant: chat.askAiAssistant,
        telemetry: shellTelemetry,
    });

    const { menuItemsGroups, messages: appMessages } = useMemo(
        () => buildAppMenu(resolvedApplications, ctx, pathname, ctx.preferredLocale),
        [resolvedApplications, ctx, pathname],
    );

    // The default help menu links exclusively to GoodData resources (documentation, university,
    // community, Slack). When white-labeling is enabled (the "Hide links to GoodData documentation"
    // setting) those must not leak into the branded header, so the host renders no default help
    // menu. Apps may still supply their own help items via headerOptions.
    const helpMenuItems = useMemo(
        () =>
            headerOptions?.helpMenuItems ??
            (ctx.whiteLabeling?.enabled ? [] : generateHeaderStaticHelpMenuItems()),
        [headerOptions, ctx.whiteLabeling?.enabled],
    );

    const accountMenuItems = useMemo<IHeaderMenuItem[]>(
        () =>
            generateHeaderAccountMenuItems(
                ctx.workspacePermissions ?? ({} as IWorkspacePermissions),
                features.workspaceId,
                ctx.settings,
            ),
        [ctx.workspacePermissions, features.workspaceId, ctx.settings],
    );

    const handleMenuItemClick = useCallback(
        (item: IHeaderMenuItem, e?: MouseEvent | KeyboardEvent) => {
            e?.preventDefault();
            if (item.onClick) {
                item.onClick(e ?? null);
                return;
            }
            if (item.key === LOGOUT_MENU_ITEM_KEY) {
                void getBackend().deauthenticate();
                return;
            }
            if (item.href) {
                if (item.target === "_blank") {
                    window.open(item.href, "_blank", "noopener,noreferrer");
                } else {
                    onNavigate(item.href);
                }
            }
        },
        [onNavigate],
    );

    const handleHeaderMouseOver = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
            if (!anchor) {
                return;
            }
            const href = anchor.getAttribute("href");
            if (!href) {
                return;
            }
            for (const app of resolvedApplications) {
                if (!isExternalPluggableApplicationRegistryItem(app)) {
                    const appHref = getApplicationHref(app, ctx, pathname);
                    if (appHref === href) {
                        preloadPluggableApplication(app);
                        return;
                    }
                }
            }
        },
        [resolvedApplications, ctx, pathname],
    );

    const handleWorkspaceSelect = useCallback(
        (workspace: IHeaderWorkspace) => {
            const newId = workspace.id;
            if (!newId) {
                return;
            }
            const search = typeof window === "undefined" ? "" : window.location.search;
            const newPath = swapWorkspaceInPath(pathname, newId);
            onNavigate(`${newPath}${search}`);
        },
        [pathname, onNavigate],
    );

    const organizationTitle = ctx.organization?.title ?? ctx.organization?.id;
    const workspacePicker =
        features.isWorkspaceApp && features.workspaceId ? (
            <AppHeaderWorkspacePicker
                backend={getBackend()}
                userId={ctx.user.login}
                workspaceId={features.workspaceId}
                onWorkspaceSelect={handleWorkspaceSelect}
            />
        ) : organizationTitle ? (
            <div className="gd-header-project">{organizationTitle}</div>
        ) : null;

    const hasTierEntitlement = ctx.entitlements?.some((e) => e.name === "Tier" && e.value);
    const defaultLogoTitle = hasTierEntitlement ? "GoodData Cloud" : "GoodData.CN";
    const logoTitle = ctx.whiteLabeling?.enabled
        ? ctx.user.organizationName || defaultLogoTitle
        : defaultLogoTitle;

    // White-label icons are applied whenever their URLs are set, independent of the `enabled` flag
    // (matching the standalone apps and the Appearance behavior). When no custom favicon is set we
    // fall back to the favicon index.html shipped (the organization favicon) instead of a hardcoded
    // "/favicon.ico": on the live platform index.html resolves the icon to
    // "<cdnurl>/organization/favicon.ico", and "/favicon.ico" is not served at the origin root — so
    // hardcoding it removed the favicon once a module mounted (DocumentHeader overwrites the link).
    const faviconUrl = ctx.whiteLabeling?.faviconUrl || initialFaviconUrl;

    // The host owns the browser tab title as "{page} - {brand}". The page segment defaults to the
    // active application's manifest title, but an embedded app can override it dynamically by emitting
    // a document-title-changed event (surfaced here as `appPageTitle`). When white-labeling
    // is enabled the brand is the organization name — preferring the user profile's name, then the
    // resolved organization descriptor title (the profile field is optional) — and is omitted (so
    // DocumentHeader drops the " - " separator) only when neither is set. The GoodData product name
    // is used solely when white-labeling is disabled, so a branded org never falls back to it.
    const activeApplication = getActiveInternalApplication(resolvedApplications, ctx, pathname);
    // An app may report an empty page segment (e.g. no insight open); treat it the same as `undefined`
    // (omitted) so the tab falls back to the active application's manifest title rather than going blank.
    const documentPageTitle =
        appPageTitle ||
        (activeApplication ? getLocalizedTitle(activeApplication, ctx.preferredLocale) : undefined);
    const documentBrandTitle = ctx.whiteLabeling?.enabled
        ? ctx.user.organizationName || ctx.organization?.title || ""
        : defaultLogoTitle;

    const headerColor = ctx.theme?.header?.backgroundColor ?? defaultHeaderTheme.backgroundColor;
    const headerTextColor = ctx.theme?.header?.color ?? defaultHeaderTheme.color;
    const activeColor = ctx.theme?.header?.activeColor ?? defaultHeaderTheme.activeColor;

    const hideChrome = ctx.embeddingMode === "iframe" || ctx.isExportMode === true;

    return (
        <HostIntlProvider locale={locale} additionalMessages={appMessages}>
            <BackendProvider backend={getBackend()}>
                <ToastsCenterContextProvider>
                    <div className={b()}>
                        <DocumentHeader
                            pageTitle={documentPageTitle}
                            brandTitle={documentBrandTitle}
                            faviconUrl={faviconUrl}
                            appleTouchIconUrl={ctx.whiteLabeling?.appleTouchIconUrl}
                        />
                        {hideChrome ? null : (
                            <div className={e("header")} onMouseOver={handleHeaderMouseOver}>
                                <AppHeader
                                    logoUrl={ctx.whiteLabeling?.logoUrl || defaultLogoUrl}
                                    logoHref="/organization" // switch the host scope to organization, the first org app will be chosen
                                    logoTitle={logoTitle}
                                    headerColor={headerColor}
                                    headerTextColor={headerTextColor}
                                    activeColor={activeColor}
                                    userName={userName}
                                    organizationName={ctx.organization?.title}
                                    isAccessibilityCompliant
                                    workspacePicker={workspacePicker}
                                    menuItemsGroups={menuItemsGroups}
                                    helpMenuItems={helpMenuItems}
                                    accountMenuItems={accountMenuItems}
                                    onMenuItemClick={handleMenuItemClick}
                                    showUpsellButton={pricing.isTrial}
                                    onUpsellButtonClick={pricing.onUpsellButtonClick}
                                    expiredDate={pricing.isTrial ? pricing.expiredDate : undefined}
                                    search={search.element}
                                    showChatItem={chat.showChatItem}
                                    onChatItemClick={chat.toggle}
                                    notificationsPanel={
                                        ctx.userSettings.enableInPlatformNotifications
                                            ? ({ isMobile, closeNotificationsOverlay }) => (
                                                  <AppHeaderNotifications
                                                      locale={locale}
                                                      isMobile={isMobile}
                                                      closeNotificationsOverlay={closeNotificationsOverlay}
                                                      useAsOfDateParam={
                                                          ctx.userSettings.enableExecutionTimestamp ?? false
                                                      }
                                                      enableExportToDocumentStorage={
                                                          ctx.userSettings.enableExportToDocumentStorage ??
                                                          false
                                                      }
                                                  />
                                              )
                                            : undefined
                                    }
                                />
                            </div>
                        )}
                        <main className={e("content")}>{children}</main>
                        {hideChrome ? null : chat.element}
                        {pricing.element}
                        <HostNotificationDispatcher notification={notification} />
                    </div>
                </ToastsCenterContextProvider>
            </BackendProvider>
        </HostIntlProvider>
    );
}
