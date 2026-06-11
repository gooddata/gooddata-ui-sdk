// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type Root as ReactRoot, createRoot } from "react-dom/client";
import { type NavigateFunction } from "react-router";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
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
    const navigationMountRef = useAutoupdateRef({ navigate, replace });

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
                        onHeaderChange={onHeaderChange}
                        onDocumentTitleChange={onDocumentTitleChange}
                    />
                </HostIntlProvider>,
            );
        } else {
            appRootRef.current.render(null);
        }
    }, [hostReady, activeInternalApplication, ctx, onHeaderChange, onDocumentTitleChange, pathname]);

    return <div ref={containerRef} className="gd-host-ui-container" />;
}
