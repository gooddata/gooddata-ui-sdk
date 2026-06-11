// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FormattedMessage } from "react-intl";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IPlatformContext,
    type IPluggableAppEvent,
    type IPluggableApplicationMountHandle,
    isReloadPlatformContextRequestedEvent,
} from "@gooddata/sdk-pluggable-application-model";
import { LoadingComponent, useAutoupdateRef } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { now } from "../debug.js";
import { getAppLifecycleCallbacks, loadPluggableApplication } from "../loader/pluggableApplicationsLoader.js";
import { getApplicationHref } from "../loader/routing.js";
import { BackendPlatformContextProvider } from "../platformContext/useLoadPlatformContext.js";

import "./PluggableApplicationRenderer.scss";

const { b, e } = bemFactory("gd-pluggable-application-renderer");

type RendererViewState = { state: "loading" } | { state: "ready" } | { state: "error"; message?: string };

export interface IPluggableApplicationRendererProps {
    app: PluggableApplicationRegistryItem;
    ctx: IPlatformContext;
    pathname: string;
    onHeaderChange?: (appId: string, header: IAppHeaderOptions) => void;
    onDocumentTitleChange?: (appId: string, pageTitle: string | undefined) => void;
}

export function PluggableApplicationRenderer({
    app,
    ctx,
    pathname,
    onHeaderChange,
    onDocumentTitleChange,
}: IPluggableApplicationRendererProps) {
    const ctxRef = useAutoupdateRef(ctx);
    const onHeaderChangeRef = useAutoupdateRef(onHeaderChange);
    const onDocumentTitleChangeRef = useAutoupdateRef(onDocumentTitleChange);
    const containerRef = useRef<HTMLDivElement>(null);
    const mountHandleRef = useRef<IPluggableApplicationMountHandle | undefined>(undefined);
    const [viewState, setViewState] = useState<RendererViewState>({ state: "loading" });
    const baseHref = getApplicationHref(app, ctx, pathname);
    const appBasePath = ctx.embeddingMode === "iframe" ? `/embedded${baseHref}` : baseHref;

    const lifecycle = getAppLifecycleCallbacks();
    const onTelemetryEvent = useMemo(
        () => lifecycle?.createTelemetryCallbacks?.(app.id),
        [lifecycle, app.id],
    );

    // onEvent is intentionally stable (empty deps) — pluggable apps capture it at mount time
    // and do not update it when the host re-renders. Do not make this callback depend on
    // any value that can change after mount, or the mounted app will silently call a stale closure.
    const onEvent = useCallback((event: IPluggableAppEvent) => {
        if (isReloadPlatformContextRequestedEvent(event)) {
            void BackendPlatformContextProvider.load();
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const mountId = `${app.id}:${Date.now()}`;
        const totalStart = now();

        const prevHandle = mountHandleRef.current;
        mountHandleRef.current = undefined;
        setViewState({ state: "loading" });

        // Defer unmount of the previous app to avoid synchronously unmounting
        // a React root while React is already rendering (race in strict mode).
        if (prevHandle) {
            queueMicrotask(() => prevHandle.unmount());
        }

        lifecycle?.onLoadStarted?.(app.id);
        const loadStart = now();

        loadPluggableApplication(app)
            .then((loadedApp) => {
                if (cancelled) {
                    return;
                }

                lifecycle?.onLoadCompleted?.(app.id, now() - loadStart);

                const container = containerRef.current;
                if (!container) {
                    throw new Error(`[host-runtime/renderer] Missing container for app "${app.id}".`);
                }

                const mountStart = now();

                mountHandleRef.current = loadedApp.mount({
                    id: mountId,
                    container,
                    ctx: ctxRef.current,
                    basePath: appBasePath,
                    onEvent,
                    onTelemetryEvent,
                    onHeaderChange: (header: IAppHeaderOptions) =>
                        onHeaderChangeRef.current?.(app.id, header),
                    onDocumentTitleChange: (pageTitle: string | undefined) =>
                        onDocumentTitleChangeRef.current?.(app.id, pageTitle),
                });

                lifecycle?.onMountCompleted?.(app.id, now() - mountStart);
                lifecycle?.onRendered?.(app.id, now() - totalStart);
                setViewState({ state: "ready" });
            })
            .catch((mountError: unknown) => {
                if (cancelled) {
                    return;
                }
                const errorMessage =
                    mountError instanceof Error ? mountError.message : "Unknown module loading error.";
                console.error(`[host-runtime/renderer] Failed to mount app "${app.id}".`, mountError);
                lifecycle?.onLoadFailed?.(app.id, errorMessage);
                setViewState({
                    state: "error",
                    message: errorMessage,
                });
            });

        return () => {
            cancelled = true;
            const handle = mountHandleRef.current;
            if (handle) {
                mountHandleRef.current = undefined;
                queueMicrotask(() => {
                    handle.unmount();
                    lifecycle?.onUnmounted?.(app.id);
                });
            }
        };
    }, [
        app,
        appBasePath,
        ctxRef,
        onHeaderChangeRef,
        onDocumentTitleChangeRef,
        onTelemetryEvent,
        lifecycle,
        onEvent,
    ]);

    useEffect(() => {
        mountHandleRef.current?.updateContext?.(ctx);
    }, [ctx]);

    return (
        <section className={b()}>
            {viewState.state === "loading" ? (
                <div className={e("loading")}>
                    <LoadingComponent height={40} />
                </div>
            ) : null}
            {viewState.state === "error" ? (
                <div className={e("error")}>
                    <h2>
                        <FormattedMessage id="gs.host.error.applicationFailedToLoad" />
                    </h2>
                    <p>{viewState.message}</p>
                </div>
            ) : null}
            <div ref={containerRef} className={e("container", { visible: viewState.state === "ready" })} />
        </section>
    );
}
