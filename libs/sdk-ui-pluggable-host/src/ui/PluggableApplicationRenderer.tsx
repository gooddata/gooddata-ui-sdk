// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessage, useIntl } from "react-intl";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IPlatformContext,
    type IPluggableApp,
    type IPluggableAppEvent,
    type IPluggableApplicationMountHandle,
    isDocumentTitleChangedEvent,
    isReloadPlatformContextRequestedEvent,
} from "@gooddata/sdk-pluggable-application-model";
import { LoadingComponent, useAutoupdateRef } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { now } from "../debug.js";
import {
    type AppSecurityFailure,
    getSecuredRemoteAppValidUntil,
    validateAppSecurity,
} from "../loader/appSecurityValidation.js";
import { getAppLifecycleCallbacks, loadPluggableApplication } from "../loader/pluggableApplicationsLoader.js";
import { getApplicationHref } from "../loader/routing.js";
import { BackendPlatformContextProvider } from "../platformContext/useLoadPlatformContext.js";

import "./PluggableApplicationRenderer.scss";

const { b, e } = bemFactory("gd-pluggable-application-renderer");

type RendererViewState =
    | { state: "loading" }
    | { state: "ready"; validUntil?: number }
    | { state: "error"; message?: string };

// Use `defineMessage` for each id so the intl extractor and validator can statically
// match them against the locale JSON files. A plain `{ id }` literal passed to
// `intl.formatMessage` is opaque to the tooling.
const SECURITY_FAILURE_MESSAGES: Record<AppSecurityFailure["kind"], MessageDescriptor> = {
    "organization-not-allowed": defineMessage({ id: "gs.host.error.appNotAllowedForOrganization" }),
    "build-expired": defineMessage({ id: "gs.host.error.appBuildExpired" }),
    "metadata-missing": defineMessage({ id: "gs.host.error.appSecurityMetadataMissing" }),
};

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
    const intl = useIntl();
    const intlRef = useAutoupdateRef(intl);
    const ctxRef = useAutoupdateRef(ctx);
    const onHeaderChangeRef = useAutoupdateRef(onHeaderChange);
    const onDocumentTitleChangeRef = useAutoupdateRef(onDocumentTitleChange);
    const containerRef = useRef<HTMLDivElement>(null);
    const mountHandleRef = useRef<IPluggableApplicationMountHandle | undefined>(undefined);
    // The app/module pair currently mounted. Held so the context-change effect can
    // re-run the security check against the live organization without reloading.
    const mountedAppRef = useRef<
        { app: PluggableApplicationRegistryItem; loadedApp: IPluggableApp } | undefined
    >(undefined);
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
    // Values that change after mount are read through refs (e.g. onDocumentTitleChangeRef).
    const onEvent = useCallback(
        (event: IPluggableAppEvent) => {
            if (isReloadPlatformContextRequestedEvent(event)) {
                void BackendPlatformContextProvider.load();
                return;
            }
            if (isDocumentTitleChangedEvent(event)) {
                onDocumentTitleChangeRef.current?.(app.id, event.payload.pageTitle);
            }
        },
        [app.id, onDocumentTitleChangeRef],
    );

    useEffect(() => {
        let cancelled = false;
        const mountId = `${app.id}:${Date.now()}`;
        const totalStart = now();

        const prevHandle = mountHandleRef.current;
        mountHandleRef.current = undefined;
        mountedAppRef.current = undefined;
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

                const securityFailure = validateAppSecurity(app, loadedApp, ctxRef.current);
                if (securityFailure) {
                    const message = intlRef.current.formatMessage(
                        SECURITY_FAILURE_MESSAGES[securityFailure.kind],
                    );
                    console.error(
                        `[host-runtime/renderer] Refusing to mount app "${app.id}": ${securityFailure.kind}.`,
                        securityFailure,
                    );
                    lifecycle?.onLoadFailed?.(app.id, securityFailure.kind);
                    setViewState({ state: "error", message });
                    return;
                }

                // Report load success only after the security check passes, so a rejected
                // app never produces both an onLoadCompleted and an onLoadFailed for the
                // same attempt.
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
                });

                mountedAppRef.current = { app, loadedApp };

                lifecycle?.onMountCompleted?.(app.id, now() - mountStart);
                lifecycle?.onRendered?.(app.id, now() - totalStart);
                setViewState({ state: "ready", validUntil: getSecuredRemoteAppValidUntil(app, loadedApp) });
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
                mountedAppRef.current = undefined;
                queueMicrotask(() => {
                    handle.unmount();
                    lifecycle?.onUnmounted?.(app.id);
                });
            }
        };
    }, [app, appBasePath, ctxRef, intlRef, onHeaderChangeRef, onTelemetryEvent, lifecycle, onEvent]);

    useEffect(() => {
        const mounted = mountedAppRef.current;
        const handle = mountHandleRef.current;
        if (!mounted || !handle) {
            return;
        }

        // Re-run the security check against the new context. The app's base path does not
        // encode the organization id, so an organization change does not re-run the mount
        // effect — without this an app could stay mounted under an organization that is no
        // longer in its allowlist (or with a now-expired build).
        const securityFailure = validateAppSecurity(mounted.app, mounted.loadedApp, ctx);
        if (securityFailure) {
            const message = intlRef.current.formatMessage(SECURITY_FAILURE_MESSAGES[securityFailure.kind]);
            console.error(
                `[host-runtime/renderer] Unmounting app "${mounted.app.id}" after context change: ${securityFailure.kind}.`,
                securityFailure,
            );
            mountHandleRef.current = undefined;
            mountedAppRef.current = undefined;
            handle.unmount();
            lifecycle?.onUnmounted?.(mounted.app.id);
            lifecycle?.onLoadFailed?.(mounted.app.id, securityFailure.kind);
            setViewState({ state: "error", message });
            return;
        }

        handle.updateContext?.(ctx);
    }, [ctx, intlRef, lifecycle]);

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
            {viewState.state === "ready" && viewState.validUntil !== undefined ? (
                <div className={e("demoBadge")} role="status">
                    <FormattedMessage
                        id="gs.host.demoApp.validUntil"
                        values={{
                            date: intl.formatDate(viewState.validUntil, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }),
                        }}
                    />
                </div>
            ) : null}
        </section>
    );
}
