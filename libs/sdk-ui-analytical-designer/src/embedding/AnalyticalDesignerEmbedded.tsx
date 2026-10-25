// (C) 2026 GoodData Corporation

import {
    type ReactElement,
    type Ref,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import { type IUserSettings, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type AdCommandBody,
    GdcAdCommandType,
    GdcProductName,
    type IAdSetApiTokenBody,
    type IFilterContextContent,
    type IGdcAdMessageEnvelope,
} from "@gooddata/sdk-embedding";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type IBootstrapData, bootstrapData, setLocale } from "../actions/app_context_actions.js";
import { setEmbedded, setReadOnlyMode } from "../actions/embedded_actions.js";
import { setFeatureFlagsItems } from "../actions/featureFlags_actions.js";
import { workspacePermissionsSuccess } from "../actions/permissions_actions.js";
import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { setHostedComponentMode } from "../appMode/appMode.js";
import { type IAdHostBackend, type IApiToken, adoptHostBackend, reinitializeBackend } from "../backend.js";
import { startSagas, store } from "../reduxStore.js";
import { Root } from "../Root.js";
import { type IHostTelemetryCallbacks } from "../services/telemetry/tracker.js";
import {
    clearHostTelemetryCallbacks,
    setHostTelemetryCallbacks,
} from "../services/telemetry/tracking_events.js";
import { getErrorsState } from "../store/app_context/app_context_selectors.js";
import { storeApiToken } from "../store/application_context/app_context_actions.js";
import { setRouteProjectId } from "../store/router/router_actions.js";

import { type IAdEmbeddedRouteConfig, buildEmbeddedHash } from "./buildEmbeddedHash.js";
import { type IAdEmbeddedCallbacks, deliverEventToCallbacks } from "./embeddedCallbacks.js";
import { type AdCommandEnvelope, installHostAdapter } from "./hostBridge.js";
import {
    type HostCommandOwner,
    activateHostCommandOwner,
    deactivateHostCommandOwner,
} from "./hostCommandGate.js";
import { sendCommandToAd } from "./hostCommands.js";
import {
    SECOND_MOUNT_ERROR_MESSAGE,
    claimAnalyticalDesignerRuntime,
    releaseAnalyticalDesignerRuntime,
} from "./mountGuard.js";
import { AdSlotsProvider, type IAnalyticalDesignerSlots } from "./slots.js";
import { getVirtualNavigate } from "./virtualLocation.js";

/**
 * Mount-scoped context of the host application. Captured once at mount; later changes are ignored
 * (token renewals go through the SetApiToken command, see IAdEmbeddedApi.setApiToken).
 */
export interface IAdEmbeddedHostContext {
    workspaceId: string;
    /** When omitted, AD loads the bootstrap data from the backend. */
    bootstrapData?: IBootstrapData;
    featureFlags?: IUserWorkspaceSettings | IUserSettings;
    workspacePermissions?: IWorkspacePermissions;
    /** Undefined means context-deferred (cookie-based) authentication. */
    auth?: IApiToken;
    /**
     * Host-owned backend to adopt instead of creating an AD-owned instance. When provided, the
     * host's auth provider owns authentication and token renewal and the host's cache is shared;
     * `auth` then only seeds the stored token for components that read it directly (SetApiToken
     * renewals keep it in sync without touching the backend).
     */
    hostBackend?: IAdHostBackend;
    externalProviderId?: string;
    locale?: string;
    /**
     * Telemetry forwarding into the host's pipeline. When omitted, no-op callbacks are registered
     * instead.
     */
    telemetryCallbacks?: IHostTelemetryCallbacks;
    /** Hides the actions that change the insight (save, save as, create new). */
    isReadOnly?: boolean;
}

/** Imperative command surface, exposed through the apiRef prop. */
export interface IAdEmbeddedApi {
    /** Raw escape hatch — inject any supported command envelope. */
    sendCommand(envelope: AdCommandEnvelope): void;
    clear(): void;
    requestCancellation(): void;
    setFilterContext(data: IFilterContextContent, contextId?: string): void;
    setApiToken(body: IAdSetApiTokenBody): void;
}

export interface IAnalyticalDesignerEmbeddedProps {
    /** Route configuration: which insight, which flow, which UI actions. Changes navigate AD. */
    config: IAdEmbeddedRouteConfig;
    /** Mount-scoped host context (workspace, bootstrap data, auth, feature flags). */
    host: IAdEmbeddedHostContext;
    callbacks?: IAdEmbeddedCallbacks;
    apiRef?: Ref<IAdEmbeddedApi>;
    /** Regions the host replaces or wraps. */
    slots?: IAnalyticalDesignerSlots;
}

function commandEnvelope<T extends GdcAdCommandType>(
    name: T,
    data: AdCommandBody<T>,
    contextId?: string,
): IGdcAdMessageEnvelope<T, AdCommandBody<T>> {
    return {
        gdc: {
            product: GdcProductName.ANALYTICAL_DESIGNER,
            event: { name, data, contextId },
        },
    };
}

const NO_SLOTS: IAnalyticalDesignerSlots = {};

const NOOP_TELEMETRY: IHostTelemetryCallbacks = {
    trackEvent: () => {},
    trackPageView: () => {},
    trackTiming: () => {},
};

/**
 * Analytical Designer rendered in-process as a React component — the iframe-free alternative to
 * embedding the deployed AD app. Communication uses the same @gooddata/sdk-embedding contract as
 * the postMessage transport, carried over the host adapter: events arrive through `callbacks`,
 * commands are sent through `apiRef`.
 *
 * Constraints (v1, same as pluggable-shell mode): the AD runtime uses a singleton store, so at
 * most one instance may be mounted per page. The mount sequence mirrors pluggableApp.tsx: seed
 * store, reinitialize backend, start sagas; unmount cancels the saga task and resets the store.
 */
export function AnalyticalDesignerEmbedded({
    config,
    host,
    callbacks,
    apiRef,
    slots,
}: IAnalyticalDesignerEmbeddedProps): ReactElement | null {
    const [ready, setReady] = useState(false);
    const [mountError, setMountError] = useState<Error | null>(null);

    const callbacksRef = useRef<IAdEmbeddedCallbacks | undefined>(callbacks);
    useEffect(() => {
        callbacksRef.current = callbacks;
    });

    // Host context is mount-scoped by contract; capture it so the mount effect can run once.
    const hostRef = useRef(host);
    const initialLocationRef = useRef<string | null>(null);
    if (initialLocationRef.current === null) {
        initialLocationRef.current = `/${buildEmbeddedHash(config)}`;
    }
    const lastNavigatedHashRef = useRef<string | null>(null);

    // The imperative api binds during the render commit, before the sagas start. sendCommandToAd
    // keeps a command until the command watchers listen, so an early command is not lost.
    // This mount owns its queued commands: when it unmounts before AD listens, they are dropped
    // rather than delivered to the runtime of a later mount.
    const commandOwnerRef = useRef<HostCommandOwner>({});
    const dispatchCommand = useCallback((envelope: AdCommandEnvelope) => {
        sendCommandToAd(envelope, commandOwnerRef.current);
    }, []);

    useEffect(() => {
        if (!claimAnalyticalDesignerRuntime()) {
            const error = new Error(SECOND_MOUNT_ERROR_MESSAGE);
            callbacksRef.current?.onError?.(error);
            setMountError(error);
            return undefined;
        }
        const commandOwner = commandOwnerRef.current;
        activateHostCommandOwner(commandOwner);
        const mountHost = hostRef.current;
        // Scope for the embedded-mode stacking overrides (styles/embedded_overrides.scss): AD's
        // floating elements portal to document.body, so an ancestor class cannot reach them —
        // only a body-level marker can.
        document.body.classList.add("gd-ad-embedded");
        const uninstallAdapter = installHostAdapter({
            onEvent: (event) => deliverEventToCallbacks(event, callbacksRef.current),
        });
        // setHostedComponentMode(true): differentiates the router choice and postMessage registration.
        store.dispatch(setHostedComponentMode(true));
        store.dispatch(setEmbedded(true));
        if (mountHost.isReadOnly) {
            store.dispatch(setReadOnlyMode(true));
        }
        if (mountHost.bootstrapData) {
            store.dispatch(bootstrapData(mountHost.bootstrapData, window));
        }
        store.dispatch(setRouteProjectId(mountHost.workspaceId));
        if (mountHost.workspacePermissions) {
            store.dispatch(
                workspacePermissionsSuccess(mountHost.workspaceId, mountHost.workspacePermissions),
            );
        }
        store.dispatch(setFeatureFlagsItems(mountHost.featureFlags ?? ({} as IUserSettings)));
        if (mountHost.locale) {
            store.dispatch(setLocale(mountHost.locale));
        }
        // Seeding the token is what makes later SetApiToken renewals take the update-in-place path
        // instead of a full backend replacement.
        if (mountHost.auth?.apiToken) {
            store.dispatch(storeApiToken(mountHost.auth.apiToken, mountHost.auth.apiTokenType ?? "gooddata"));
        }
        if (mountHost.hostBackend) {
            adoptHostBackend(mountHost.hostBackend);
        } else {
            reinitializeBackend(mountHost.auth, mountHost.externalProviderId);
        }
        const telemetryCallbacks = mountHost.telemetryCallbacks ?? NOOP_TELEMETRY;
        setHostTelemetryCallbacks(telemetryCallbacks);
        // Report each error that stops AD from starting; the store keeps them in order.
        let reportedErrors = 0;
        const unsubscribeErrors = store.subscribe(() => {
            const errors = getErrorsState(store.getState());
            if (errors.length > reportedErrors) {
                reportedErrors = errors.length;
                callbacksRef.current?.onError?.(errors[errors.length - 1]);
            } else if (errors.length < reportedErrors) {
                reportedErrors = errors.length;
            }
        });
        const rootTask = startSagas();
        setReady(true);
        return () => {
            deactivateHostCommandOwner(commandOwner);
            unsubscribeErrors();
            rootTask.cancel();
            uninstallAdapter();
            clearHostTelemetryCallbacks(telemetryCallbacks);
            store.dispatch(resetForPluggableMount());
            document.body.classList.remove("gd-ad-embedded");
            releaseAnalyticalDesignerRuntime();
        };
        // Mount/unmount lifecycle only — the host context is captured at mount by contract.
    }, []);

    // Route changes after mount (open/switch insight) navigate the memory router — the same
    // trigger semantics as the iframe src hash swap.
    const currentHash = buildEmbeddedHash(config);
    useEffect(() => {
        if (!ready) {
            return;
        }
        if (lastNavigatedHashRef.current === null) {
            // First pass: the memory router already booted at the initial location.
            lastNavigatedHashRef.current = currentHash;
            return;
        }
        if (currentHash !== lastNavigatedHashRef.current) {
            lastNavigatedHashRef.current = currentHash;
            getVirtualNavigate()?.(currentHash);
        }
    }, [ready, currentHash]);

    useImperativeHandle(
        apiRef,
        () => ({
            sendCommand: dispatchCommand,
            clear: () => dispatchCommand(commandEnvelope(GdcAdCommandType.Clear, null)),
            requestCancellation: () =>
                dispatchCommand(commandEnvelope(GdcAdCommandType.RequestCancellation, null)),
            setFilterContext: (data: IFilterContextContent, contextId?: string) =>
                dispatchCommand(commandEnvelope(GdcAdCommandType.SetFilterContext, data, contextId)),
            setApiToken: (body: IAdSetApiTokenBody) =>
                dispatchCommand(commandEnvelope(GdcAdCommandType.SetApiToken, body)),
        }),
        [dispatchCommand],
    );

    if (mountError) {
        throw mountError;
    }

    if (!ready) {
        return null;
    }

    return (
        <AdSlotsProvider value={slots ?? NO_SLOTS}>
            <Root initialLocation={initialLocationRef.current} />
        </AdSlotsProvider>
    );
}
