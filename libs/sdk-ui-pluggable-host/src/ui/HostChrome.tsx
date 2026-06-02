// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useMemo } from "react";

import {
    isExternalPluggableApplicationRegistryItem,
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
    type IHeaderMenuItem,
    type IHeaderWorkspace,
    ToastsCenterContextProvider,
    generateHeaderStaticHelpMenuItems,
} from "@gooddata/sdk-ui-kit";
import { defaultHeaderTheme } from "@gooddata/sdk-ui-theme-provider";

import defaultLogoUrl from "../assets/logo-white.svg";
import {
    getAppLifecycleCallbacks,
    preloadPluggableApplication,
} from "../loader/pluggableApplicationsLoader.js";
import { getApplicationHref } from "../loader/routing.js";
import { getBackend } from "../platformContext/backend.js";

import { buildAppMenu } from "./appMenuItems.js";
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

export interface IHostChromeProps {
    ctx: IPlatformContext;
    resolvedApplications: PluggableApplicationRegistryItem[];
    pathname: string;
    onNavigate: (url: string) => void;
    onReplace: (url: string) => void;
    headerOptions?: IAppHeaderOptions;
    notification?: IHostUiNotification | null;
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

    const helpMenuItems = useMemo(
        () => headerOptions?.helpMenuItems ?? generateHeaderStaticHelpMenuItems(),
        [headerOptions],
    );

    const accountMenuItems = useMemo<IHeaderMenuItem[]>(
        () => [
            {
                key: LOGOUT_MENU_ITEM_KEY,
                onClick: () => {
                    void getBackend().deauthenticate();
                },
            },
        ],
        [],
    );

    const handleMenuItemClick = useCallback(
        (item: IHeaderMenuItem, e?: MouseEvent | KeyboardEvent) => {
            e?.preventDefault();
            if (item.onClick) {
                item.onClick(e ?? null);
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

    const headerColor = ctx.theme?.header?.backgroundColor ?? defaultHeaderTheme.backgroundColor;
    const headerTextColor = ctx.theme?.header?.color ?? defaultHeaderTheme.color;
    const activeColor = ctx.theme?.header?.activeColor ?? defaultHeaderTheme.activeColor;

    const isEmbedded = ctx.embeddingMode === "iframe";

    return (
        <HostIntlProvider locale={locale} additionalMessages={appMessages}>
            <BackendProvider backend={getBackend()}>
                <ToastsCenterContextProvider>
                    <div className={b()}>
                        {isEmbedded ? null : (
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
                                    onChatItemClick={chat.open}
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
                        {chat.element}
                        {pricing.element}
                        <HostNotificationDispatcher notification={notification} />
                    </div>
                </ToastsCenterContextProvider>
            </BackendProvider>
        </HostIntlProvider>
    );
}
