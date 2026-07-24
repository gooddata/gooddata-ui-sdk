// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type Root as ReactRoot, createRoot } from "react-dom/client";
import { type NavigateFunction } from "react-router";

import { type IGenAIUserContext, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IPlatformContext,
    type IHostUiMountHandle,
} from "@gooddata/sdk-pluggable-application-model";
import { resolveLocale, useAutoupdateRef } from "@gooddata/sdk-ui";

import { now } from "../debug.js";
import { setActiveHostHandle } from "../lib/hostNotifications.js";
import { getAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";
import { getActiveInternalApplication } from "../loader/routing.js";
import {
    HostChat,
    type IHostChatContext,
    type IHostChatLink,
    type IHostChatVisibility,
} from "../ui/HostChat.js";
import { HostIntlProvider } from "../ui/HostIntlProvider.js";
import { PluggableApplicationRenderer } from "../ui/PluggableApplicationRenderer.js";
import { resolveHostUiModule } from "../ui/resolveHostUiModule.js";

import "./HostUiContainer.scss";

export interface IHostUiContainerProps {
    ctx: IPlatformContext;
    apps: PluggableApplicationRegistryItem[];
    pathname: string;
    routerNavigate: NavigateFunction;
}

/**
 * Mounts the host UI module into a container div, then renders the active
 * pluggable application into the host's app slot. Handles all lifecycle
 * updates (context, apps, pathname) via the host mount handle.
 */
export function HostUiContainer({ ctx, apps, pathname, routerNavigate }: IHostUiContainerProps) {
    const activeInternalApplication = useMemo(
        () => getActiveInternalApplication(apps, ctx, pathname),
        [apps, ctx, pathname],
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<IHostUiMountHandle>(undefined);
    const appRootRef = useRef<ReactRoot>(undefined);
    const [hostReady, setHostReady] = useState(false);
    const latestMountStateRef = useAutoupdateRef({ ctx, apps, pathname });

    const [headerOptions, setHeaderOptions] = useState<IAppHeaderOptions | undefined>(undefined);
    const [pageTitle, setPageTitle] = useState<string | undefined>(undefined);
    // Host-owned chat open-state, sourced from HostChat and forwarded to the active pluggable app.
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    // Header chat-button state (visibility + open) pushed down to the host UI module so it can render
    // the header button to match the host-owned chat.
    const [chatButtonState, setChatButtonState] = useState({ showChatItem: false, isOpen: false });
    const onChatStateChange = useCallback((state: { showChatItem: boolean; isOpen: boolean }) => {
        setChatButtonState((prev) =>
            prev.showChatItem === state.showChatItem && prev.isOpen === state.isOpen ? prev : state,
        );
    }, []);
    // Open/close/toggle requests and tag scope driving the host's single chat (HostChat). Sources:
    // app events (via PluggableApplicationRenderer), the header chat button, and the header search.
    const [aiVisibility, setAiVisibility] = useState<IHostChatVisibility | null>(null);
    const [aiContext, setAiContext] = useState<IHostChatContext | null>(null);
    const aiVisibilitySeqRef = useRef(0);
    const requestOpenAi = useCallback(
        (
            question?: string,
            agentId?: string,
            userContext?: IGenAIUserContext,
            appendToChat?: boolean,
            replaceUserContext?: boolean,
        ) => {
            setAiVisibility({
                kind: "open",
                agentId,
                question,
                userContext,
                appendToChat,
                replaceUserContext,
                seq: ++aiVisibilitySeqRef.current,
            });
        },
        [],
    );
    const requestCloseAi = useCallback(() => {
        setAiVisibility({ kind: "close", seq: ++aiVisibilitySeqRef.current });
    }, []);
    const requestToggleAi = useCallback(() => {
        setAiVisibility({ kind: "toggle", seq: ++aiVisibilitySeqRef.current });
    }, []);
    const setAiAssistantContext = useCallback((context: IHostChatContext) => {
        setAiContext(context);
    }, []);
    // The active app's chat-link handler, populated by PluggableApplicationRenderer (which holds the
    // app mount handle) and read by HostChat's chat so embedded apps can handle link clicks in-app.
    const appAiLinkClickRef = useRef<((link: IHostChatLink) => boolean) | undefined>(undefined);
    const onAppLinkClick = useCallback(
        (link: IHostChatLink) => appAiLinkClickRef.current?.(link) ?? false,
        [],
    );
    const activeAppRef = useAutoupdateRef(activeInternalApplication);
    const onHeaderChange = useCallback(
        (appId: string, header: IAppHeaderOptions) => {
            if (activeAppRef.current?.id === appId) {
                setHeaderOptions(header);
            }
        },
        [activeAppRef],
    );
    const onDocumentTitleChange = useCallback(
        (appId: string, title: string | undefined) => {
            if (activeAppRef.current?.id === appId) {
                setPageTitle(title);
            }
        },
        [activeAppRef],
    );

    // Stable navigation callbacks that always use the latest router navigate
    const navigateRef = useAutoupdateRef(routerNavigate);
    const navigate = useCallback(
        (url: string) => {
            void navigateRef.current(url);
        },
        [navigateRef],
    );
    const replace = useCallback(
        (url: string) => {
            void navigateRef.current(url, { replace: true });
        },
        [navigateRef],
    );
    const navigationMountRef = useAutoupdateRef({
        navigate,
        replace,
        onChatToggleRequested: requestToggleAi,
        onAskAiAssistant: requestOpenAi,
    });

    // Mount the host UI once; obtain the app container for rendering active apps
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let mounted = true;
        const mountStart = now();

        void resolveHostUiModule(latestMountStateRef.current.ctx).then((hostUiModule) => {
            if (!mounted) {
                return;
            }

            const latestState = latestMountStateRef.current;
            const handle = hostUiModule.mount({
                container,
                ctx: latestState.ctx,
                resolvedApplications: latestState.apps,
                pathname: latestState.pathname,
                navigate: navigationMountRef.current.navigate,
                replace: navigationMountRef.current.replace,
                onChatToggleRequested: navigationMountRef.current.onChatToggleRequested,
                onAskAiAssistant: navigationMountRef.current.onAskAiAssistant,
            });

            handleRef.current = handle;
            appRootRef.current = createRoot(handle.getAppContainer());
            setHostReady(true);

            getAppLifecycleCallbacks()?.onHostUiMounted?.(now() - mountStart);

            // Replay the latest values in case they changed while the async host UI module was resolving.
            handle.updateContext?.(latestState.ctx);
            handle.updateApplications?.(latestState.apps);
            handle.updatePathname?.(latestState.pathname);

            // Route runtime notifications (e.g. new-deployment-available) to this UI;
            // any notifications queued during mount are flushed inside setActiveHostHandle.
            setActiveHostHandle(handle);
        });

        return () => {
            mounted = false;
            setActiveHostHandle(undefined);
            const appRoot = appRootRef.current;
            appRootRef.current = undefined;
            const handle = handleRef.current;
            handleRef.current = undefined;
            appRoot?.unmount();
            handle?.unmount();
        };
        // Mount only once; updates are pushed via handle
    }, [latestMountStateRef, navigationMountRef]);

    // Push updates when context, apps, or pathname change after initial mount
    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updateContext?.(ctx);
    }, [hostReady, ctx]);

    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updateApplications?.(apps);
    }, [hostReady, apps]);

    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updatePathname?.(pathname);
    }, [hostReady, pathname]);

    // Push header options to the host UI whenever they change
    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updateHeader?.(headerOptions);
    }, [hostReady, headerOptions]);

    // Push the active application's page title to the host UI whenever it changes
    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updateDocumentTitle?.(pageTitle);
    }, [hostReady, pageTitle]);

    // Push the host-owned chat button state (visibility + open) to the host UI whenever it changes
    useEffect(() => {
        if (!hostReady) {
            return;
        }
        handleRef.current?.updateChatState?.(chatButtonState);
    }, [hostReady, chatButtonState]);

    // Track app navigation and page views when the active application changes.
    // Also clear header options on app switch so stale customizations don't leak.
    const prevAppIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const lifecycle = getAppLifecycleCallbacks();
        const activeId = activeInternalApplication?.id;
        if (activeId !== prevAppIdRef.current) {
            if (activeId) {
                lifecycle?.onAppNavigation?.(activeId, pathname);
                lifecycle?.onPageVisited?.(activeId);
            }
            prevAppIdRef.current = activeId;
            setHeaderOptions(undefined);
            setPageTitle(undefined);
            // Clear the previous app's AI context (tag scope + embedded presentation/placement) so it
            // does not leak into the next app, which may never emit its own aiAssistantContextChanged.
            setAiContext(null);
        }
    }, [activeInternalApplication, pathname]);

    // Render the active pluggable application into the host UI's app container
    useEffect(() => {
        if (!hostReady || !appRootRef.current) {
            return;
        }

        if (activeInternalApplication) {
            appRootRef.current.render(
                <HostIntlProvider locale={resolveLocale(ctx.preferredLocale)}>
                    <PluggableApplicationRenderer
                        key={activeInternalApplication.id}
                        app={activeInternalApplication}
                        ctx={ctx}
                        pathname={pathname}
                        aiAssistantOpen={aiAssistantOpen}
                        onOpenAiAssistant={requestOpenAi}
                        onCloseAiAssistant={requestCloseAi}
                        onAiAssistantContext={setAiAssistantContext}
                        aiLinkClickHandlerRef={appAiLinkClickRef}
                        onHeaderChange={onHeaderChange}
                        onDocumentTitleChange={onDocumentTitleChange}
                    />
                </HostIntlProvider>,
            );
        } else {
            appRootRef.current.render(null);
        }
    }, [
        hostReady,
        activeInternalApplication,
        ctx,
        onHeaderChange,
        onDocumentTitleChange,
        pathname,
        aiAssistantOpen,
        requestOpenAi,
        requestCloseAi,
        setAiAssistantContext,
    ]);

    return (
        <>
            <div ref={containerRef} className="gd-host-ui-container" />
            {/* Export rendering must not include the interactive chat — even though the chat is hidden
                from the chrome, GenAIChatDialog reopens from its persisted open-state on mount, so it
                would otherwise surface in the export. */}
            {hostReady && !ctx.isExportMode ? (
                <HostChat
                    ctx={ctx}
                    resolvedApplications={apps}
                    pathname={pathname}
                    activeAppId={activeInternalApplication?.id}
                    visibility={aiVisibility}
                    context={aiContext}
                    onOpenChange={setAiAssistantOpen}
                    onChatStateChange={onChatStateChange}
                    onAppLinkClick={onAppLinkClick}
                />
            ) : null}
        </>
    );
}
