// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessage, useIntl } from "react-intl";

import {
    type GenAIChatEffort,
    type IGenAIUserContext,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IAiAssistantAppEvent,
    type IAiAssistantChatEvent,
    type IAppHeaderOptions,
    type IHostNavigationRequest,
    type IPlatformContext,
    type IPluggableApp,
    type IPluggableAppEvent,
    type IPluggableApplicationMountHandle,
    isAiAssistantContextChangedEvent,
    isAiAssistantEventSentEvent,
    isCloseAiAssistantRequestedEvent,
    isDocumentTitleChangedEvent,
    isOpenAiAssistantRequestedEvent,
    isOpenPricingDialogRequestedEvent,
    isReloadPlatformContextRequestedEvent,
} from "@gooddata/sdk-pluggable-application-model";
import { LoadingComponent, useAutoupdateRef } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { now } from "../debug.js";
import { setActiveAppAttribute } from "../lib/activeAppAttribute.js";
import { activateAppStylesheets, deactivateAppStylesheets } from "../lib/stylesheetRegistry.js";
import {
    type AppSecurityFailure,
    describeSecurityFailure,
    getSecuredRemoteAppValidUntil,
    validateAppSecurity,
} from "../loader/appSecurityValidation.js";
import {
    getAppLifecycleCallbacks,
    getHostTelemetryServices,
    loadPluggableApplication,
} from "../loader/pluggableApplicationsLoader.js";
import { getApplicationHref } from "../loader/routing.js";
import { BackendPlatformContextProvider } from "../platformContext/useLoadPlatformContext.js";
import { type IPluggableModuleLifecycleInfo, type PluggableModuleFailurePhase } from "../types/lifecycle.js";

import "./PluggableApplicationRenderer.scss";

const { b, e } = bemFactory("gd-pluggable-application-renderer");

const APPLICATION: IPluggableModuleLifecycleInfo = { kind: "application" };

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
    /** Host-owned AI assistant chat open-state, forwarded to the mounted app's handle. */
    aiAssistantOpen?: boolean;
    /** Open/ask the host-owned chat, requested by the active app via an open-assistant event. */
    onOpenAiAssistant?: (
        question?: string,
        agentId?: string,
        userContext?: IGenAIUserContext,
        appendToChat?: boolean,
        replaceUserContext?: boolean,
        effort?: GenAIChatEffort,
        conversationId?: string,
    ) => void;
    /** Close the host-owned chat, requested by the active app. */
    onCloseAiAssistant?: () => void;
    /** Report the active app's AI-assistant tag scope, presentation and ambient user context to the host-owned chat. */
    onAiAssistantContext?: (context: {
        includeTags?: string[];
        excludeTags?: string[];
        dialogPosition?: "left" | "right";
        embedded?: boolean;
        disabled?: boolean;
        userContext?: IGenAIUserContext;
        userContextLoading?: boolean;
    }) => void;
    /** Hand an event the active app sent to the host-owned chat, without reading it. */
    onAiAssistantAppEvent?: (event: IAiAssistantAppEvent) => void;
    /**
     * Ref the renderer populates with a handler that delegates a host-chat link click to the active
     * app's mount handle (`onAiAssistantLinkClicked`), so an embedded app can handle it in-app.
     */
    aiLinkClickHandlerRef?: RefObject<
        ((link: { type?: string; id?: string; itemUrl?: string; newTab?: boolean }) => boolean) | undefined
    >;
    /**
     * Ref the renderer populates with a handler that delegates a host-chat event to the active
     * app's mount handle (`onAiAssistantEventReceive`), so an embedded app can handle it in-app.
     * Events received during startup are buffered until mount returns. Must be referentially
     * stable — a new ref object remounts the application.
     */
    aiEventReceiveRef?: RefObject<((event: IAiAssistantChatEvent) => void) | undefined>;
    /**
     * Ref the renderer populates with a handler that asks the active app's mount handle
     * (`onHostNavigationRequested`) whether the host may navigate away. Must be referentially
     * stable — a new ref object remounts the application.
     */
    navigationRequestRef?: RefObject<((request: IHostNavigationRequest) => boolean) | undefined>;
    onHeaderChange?: (appId: string, header: IAppHeaderOptions) => void;
    onDocumentTitleChange?: (appId: string, pageTitle: string | undefined) => void;
    /** Open the host UI's pricing dialog, requested by the active app. */
    onOpenPricingDialog?: () => void;
}

export function PluggableApplicationRenderer({
    app,
    ctx,
    pathname,
    aiAssistantOpen,
    onOpenAiAssistant,
    onCloseAiAssistant,
    onAiAssistantContext,
    onAiAssistantAppEvent,
    aiLinkClickHandlerRef,
    aiEventReceiveRef,
    navigationRequestRef,
    onHeaderChange,
    onDocumentTitleChange,
    onOpenPricingDialog,
}: IPluggableApplicationRendererProps) {
    const intl = useIntl();
    const intlRef = useAutoupdateRef(intl);
    const ctxRef = useAutoupdateRef(ctx);
    const onHeaderChangeRef = useAutoupdateRef(onHeaderChange);
    const onDocumentTitleChangeRef = useAutoupdateRef(onDocumentTitleChange);
    const onOpenAiAssistantRef = useAutoupdateRef(onOpenAiAssistant);
    const onCloseAiAssistantRef = useAutoupdateRef(onCloseAiAssistant);
    const onAiAssistantContextRef = useAutoupdateRef(onAiAssistantContext);
    const onAiAssistantAppEventRef = useAutoupdateRef(onAiAssistantAppEvent);
    const onOpenPricingDialogRef = useAutoupdateRef(onOpenPricingDialog);
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
    const telemetryServices = getHostTelemetryServices();
    const onTelemetryEvent = useMemo(
        () => telemetryServices?.createTelemetryCallbacks?.(app.id),
        [telemetryServices, app.id],
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
            // The active pluggable application owns no chat dialog on hosted routes; it requests
            // the host's single (host-owned) assistant through these events (open/ask, close and
            // tag-scope changes), which the host runtime drives directly via these callbacks.
            if (isOpenAiAssistantRequestedEvent(event)) {
                onOpenAiAssistantRef.current?.(
                    event.payload.question,
                    event.payload.agentId,
                    event.payload.userContext,
                    event.payload.appendToChat,
                    event.payload.replaceUserContext,
                    event.payload.effort,
                    event.payload.conversationId,
                );
                return;
            }
            if (isCloseAiAssistantRequestedEvent(event)) {
                onCloseAiAssistantRef.current?.();
                return;
            }
            if (isAiAssistantContextChangedEvent(event)) {
                onAiAssistantContextRef.current?.(event.payload);
                return;
            }
            if (isAiAssistantEventSentEvent(event)) {
                onAiAssistantAppEventRef.current?.(event.payload);
                return;
            }
            if (isOpenPricingDialogRequestedEvent(event)) {
                onOpenPricingDialogRef.current?.();
                return;
            }
            if (isDocumentTitleChangedEvent(event)) {
                onDocumentTitleChangeRef.current?.(app.id, event.payload.pageTitle);
            }
        },
        [
            app.id,
            onDocumentTitleChangeRef,
            onOpenAiAssistantRef,
            onCloseAiAssistantRef,
            onAiAssistantContextRef,
            onAiAssistantAppEventRef,
            onOpenPricingDialogRef,
        ],
    );

    useEffect(() => {
        let cancelled = false;
        const mountId = `${app.id}:${Date.now()}`;
        const totalStart = now();

        // Identity must change per mount — the host rejects a `proceed` retained from an earlier one.
        const navigationRequest = (request: IHostNavigationRequest) =>
            mountHandleRef.current?.onHostNavigationRequested?.(request) ?? false;

        // Keep opaque chat events with this mount attempt, not the renderer instance: a workspace
        // switch can remount the app without replacing the renderer.
        let pendingAiEvents: IAiAssistantChatEvent[] | undefined = [];
        const aiEventReceive = (event: IAiAssistantChatEvent) => {
            if (cancelled || aiEventReceiveRef?.current !== aiEventReceive) {
                return;
            }
            if (pendingAiEvents) {
                pendingAiEvents.push(event);
                return;
            }
            mountHandleRef.current?.onAiAssistantEventReceive?.(event);
        };
        const clearAiEventReceive = () => {
            pendingAiEvents = undefined;
            if (aiEventReceiveRef?.current === aiEventReceive) {
                aiEventReceiveRef.current = undefined;
            }
        };
        if (aiEventReceiveRef) {
            aiEventReceiveRef.current = aiEventReceive;
        }

        const prevHandle = mountHandleRef.current;
        mountHandleRef.current = undefined;
        mountedAppRef.current = undefined;
        setViewState({ state: "loading" });
        activateAppStylesheets(app.id);

        // unmount() is synchronous, so calling it inline can re-enter React while the parent render
        // that swapped this application out is still in progress.
        if (prevHandle) {
            queueMicrotask(() => prevHandle.unmount());
        }

        lifecycle?.onLoadStarted?.(app.id, APPLICATION);
        const loadStart = now();
        let phase: PluggableModuleFailurePhase = "load";

        loadPluggableApplication(app)
            .then((loadedApp) => {
                if (cancelled) {
                    return;
                }

                const securityFailure = validateAppSecurity(app, loadedApp, ctxRef.current);
                if (securityFailure) {
                    clearAiEventReceive();
                    const message = intlRef.current.formatMessage(
                        SECURITY_FAILURE_MESSAGES[securityFailure.kind],
                    );
                    console.error(
                        `[host-runtime/renderer] Refusing to mount app "${app.id}": ${describeSecurityFailure(securityFailure)}.`,
                        securityFailure,
                    );
                    lifecycle?.onLoadFailed?.(app.id, securityFailure.kind, {
                        kind: "application",
                        phase: "security",
                    });
                    deactivateAppStylesheets(app.id);
                    setViewState({ state: "error", message });
                    return;
                }

                // Report load success only after the security check passes, so a rejected
                // app never produces both an onLoadCompleted and an onLoadFailed for the
                // same attempt.
                lifecycle?.onLoadCompleted?.(app.id, now() - loadStart, APPLICATION);
                phase = "mount";

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
                if (navigationRequestRef) {
                    navigationRequestRef.current = navigationRequest;
                }

                // Continue queueing during replay so reentrant deliveries cannot overtake older events.
                while (pendingAiEvents?.length && !cancelled) {
                    const event = pendingAiEvents.shift();
                    if (event) {
                        try {
                            mountHandleRef.current?.onAiAssistantEventReceive?.(event);
                        } catch (error) {
                            console.error(
                                `[host-runtime/renderer] Failed to replay AI assistant event for app "${app.id}".`,
                                error,
                            );
                        }
                    }
                }
                pendingAiEvents = undefined;

                lifecycle?.onMountCompleted?.(app.id, now() - mountStart, APPLICATION);
                lifecycle?.onRendered?.(app.id, now() - totalStart);
                setViewState({ state: "ready", validUntil: getSecuredRemoteAppValidUntil(app, loadedApp) });
            })
            .catch((mountError: unknown) => {
                if (cancelled) {
                    return;
                }
                clearAiEventReceive();
                // An application shown as failed must not veto navigation — its dialog would render
                // into a hidden container.
                if (navigationRequestRef?.current === navigationRequest) {
                    navigationRequestRef.current = undefined;
                }
                const errorMessage =
                    mountError instanceof Error ? mountError.message : "Unknown module loading error.";
                console.error(`[host-runtime/renderer] Failed to mount app "${app.id}".`, mountError);
                lifecycle?.onLoadFailed?.(app.id, errorMessage, { kind: "application", phase });
                deactivateAppStylesheets(app.id);
                setViewState({
                    state: "error",
                    message: errorMessage,
                });
            });

        return () => {
            cancelled = true;
            clearAiEventReceive();
            // Only ever clear this mount's own registration, never a newer mount's.
            if (navigationRequestRef?.current === navigationRequest) {
                navigationRequestRef.current = undefined;
            }
            deactivateAppStylesheets(app.id);
            const handle = mountHandleRef.current;
            if (handle) {
                mountHandleRef.current = undefined;
                mountedAppRef.current = undefined;
                queueMicrotask(() => {
                    handle.unmount();
                    lifecycle?.onUnmounted?.(app.id, APPLICATION);
                });
            }
        };
    }, [
        app,
        appBasePath,
        ctxRef,
        intlRef,
        onHeaderChangeRef,
        onTelemetryEvent,
        lifecycle,
        onEvent,
        navigationRequestRef,
        aiEventReceiveRef,
    ]);

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
                `[host-runtime/renderer] Unmounting app "${mounted.app.id}" after context change: ${describeSecurityFailure(securityFailure)}.`,
                securityFailure,
            );
            mountHandleRef.current = undefined;
            mountedAppRef.current = undefined;
            if (navigationRequestRef) {
                navigationRequestRef.current = undefined;
            }
            deactivateAppStylesheets(mounted.app.id);
            handle.unmount();
            lifecycle?.onUnmounted?.(mounted.app.id, APPLICATION);
            lifecycle?.onLoadFailed?.(mounted.app.id, securityFailure.kind, {
                kind: "application",
                phase: "security",
            });
            setViewState({ state: "error", message });
            return;
        }

        handle.updateContext?.(ctx);
    }, [ctx, intlRef, lifecycle, navigationRequestRef]);

    // Keep the write here, not in the host container: the call site keys this component by app
    // id, so the attribute changes in the same commit that swaps the app container. Driven from
    // the container's own root it could name the incoming app while the outgoing app's DOM is
    // still in the document. Must stay a layout effect — a passive one can run after the browser
    // has already painted the incoming app under the outgoing app's id.
    useLayoutEffect(() => {
        setActiveAppAttribute(app.id);
        return () => setActiveAppAttribute(undefined);
    }, [app.id]);

    // Forward the host-owned chat open-state to the mounted app once it is ready, and on every
    // change, so app-side assistant controls stay aligned with the real (host) state (LX-2544).
    useEffect(() => {
        if (viewState.state !== "ready" || aiAssistantOpen === undefined) {
            return;
        }
        mountHandleRef.current?.setAiAssistantOpen?.(aiAssistantOpen);
    }, [aiAssistantOpen, viewState.state]);

    // Expose a host-chat link-click delegate that defers to the active app's mount handle, so an
    // embedded app can handle clicks in-app (e.g. open a visualization overlay) rather than navigating.
    // Read through the ref at call time so it always targets the currently mounted app.
    useEffect(() => {
        const ref = aiLinkClickHandlerRef;
        if (!ref) {
            return;
        }
        ref.current = (link) => mountHandleRef.current?.onAiAssistantLinkClicked?.(link) ?? false;
        return () => {
            ref.current = undefined;
        };
    }, [aiLinkClickHandlerRef]);

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
