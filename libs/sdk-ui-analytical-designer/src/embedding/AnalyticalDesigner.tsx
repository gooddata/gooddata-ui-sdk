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
import { type IAdSetApiTokenBody } from "@gooddata/sdk-embedding";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";
import { ErrorComponent, LoadingComponent, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { type IApiToken } from "../backend.js";
import { backendBootstrapData, loadSettings } from "../sagas/bootstrap/backendBootstrapData.js";

import {
    type IResolvedRouteIdentifiers,
    applyConfigToBootstrapData,
    resolveRouteIdentifiers,
    resolveTheme,
    routeTargetKey,
    toEmbeddedCallbacks,
    toRouteConfig,
} from "./analyticalDesignerConfig.js";
import { AnalyticalDesignerEmbedded, type IAdEmbeddedApi } from "./AnalyticalDesignerEmbedded.js";
import {
    type IAnalyticalDesignerApi,
    type IAnalyticalDesignerConfig,
    type IAnalyticalDesignerProps,
} from "./analyticalDesignerTypes.js";
import {
    type IAnalyticalDesignerErrorProps,
    type IAnalyticalDesignerLoadingProps,
    renderSlot,
} from "./slots.js";

/** Commands of the GoodData apps: the public commands plus the token renewal. */
export interface IAnalyticalDesignerInternalApi extends IAnalyticalDesignerApi {
    setApiToken(body: IAdSetApiTokenBody): void;
}

/** Props of the GoodData apps that do not own the auth provider of the backend. */
export interface IAnalyticalDesignerInternalProps extends Omit<IAnalyticalDesignerProps, "apiRef"> {
    /** Seeds the stored token, so the SetApiToken renewals update it in place. */
    auth?: IApiToken;
    externalProviderId?: string;
    apiRef?: Ref<IAnalyticalDesignerInternalApi>;
}

interface IHostData {
    bootstrapData: IBootstrapData;
    settings: IUserWorkspaceSettings | IUserSettings;
    permissions: IWorkspacePermissions;
}

interface IResolvedRoute {
    key: string;
    identifiers: IResolvedRouteIdentifiers;
}

const NO_CONFIG: IAnalyticalDesignerConfig = {};

function DefaultLoading({ className }: IAnalyticalDesignerLoadingProps) {
    return <LoadingComponent className={className} />;
}

function DefaultError({ error }: IAnalyticalDesignerErrorProps) {
    const message = error instanceof Error ? error.message : "Analytical Designer cannot start.";
    return <ErrorComponent message={message} />;
}

async function loadHostData(
    props: IAnalyticalDesignerInternalProps,
    backend: ReturnType<typeof useBackendStrict>,
    workspace: string,
): Promise<IHostData> {
    const config = props.config ?? NO_CONFIG;
    const { organization } = config;
    const settings = config.settings ?? (await loadSettings(backend, workspace));
    const [data, permissions] = await Promise.all([
        backendBootstrapData(backend, workspace, config.locale, {
            settings,
            user: config.user,
            organization: organization?.id ? { id: organization.id, title: organization.title } : undefined,
            entitlements: organization?.entitlements,
            colorPalette: config.colorPalette,
            loadTheme: !props.theme && !props.disableThemeLoading,
        }),
        props.permissions ?? backend.workspace(workspace).permissions().getPermissionsForCurrentUser(),
    ]);
    const theme = resolveTheme(props, data.theme);
    return { bootstrapData: applyConfigToBootstrapData(data, config, theme), settings, permissions };
}

function routeKey(props: IAnalyticalDesignerInternalProps): string {
    const config = props.config ?? NO_CONFIG;
    const sourceDashboard =
        typeof config.sourceDashboard === "string"
            ? `id:${config.sourceDashboard}`
            : routeTargetKey(config.sourceDashboard);
    return [routeTargetKey(props.insight), sourceDashboard, routeTargetKey(config.sourceInsight)].join("|");
}

/**
 * Analytical Designer with the props of the GoodData apps. The public component and the ./internal
 * one render it.
 */
export function AnalyticalDesignerInternal(props: IAnalyticalDesignerInternalProps): ReactElement {
    const backend = useBackendStrict(props.backend, "AnalyticalDesigner");
    const workspace = useWorkspaceStrict(props.workspace, "AnalyticalDesigner");
    const config = props.config ?? NO_CONFIG;

    // The effects read the latest props through the ref, so a new callback or config object does not
    // restart them.
    const propsRef = useRef(props);
    useEffect(() => {
        propsRef.current = props;
    });

    const [hostData, setHostData] = useState<IHostData | null>(null);
    const [error, setError] = useState<unknown>(null);
    const reportError = useCallback((reason: unknown) => {
        setError(reason);
        propsRef.current.onError?.(reason);
    }, []);
    // A route that fails to resolve shows the error until a later route resolves.
    const [routeError, setRouteError] = useState<unknown>(null);
    const reportRouteError = useCallback((reason: unknown) => {
        setRouteError(reason);
        propsRef.current.onError?.(reason);
    }, []);

    // The host data is mount-scoped, as the runtime it seeds: the runtime gets the same backend and
    // workspace as the host data, even when the props change before it mounts.
    const [mount] = useState(() => ({ backend, workspace }));
    // The runtime reads its host context once, so the resets call the latest `cacheReset`.
    const [cacheReset] = useState(() => ({
        resetAllCaches: () => propsRef.current.cacheReset?.resetAll?.(),
        resetCatalogs: () => propsRef.current.cacheReset?.resetCatalogs?.(),
    }));
    useEffect(() => {
        let cancelled = false;
        loadHostData(propsRef.current, mount.backend, mount.workspace).then(
            (data) => !cancelled && setHostData(data),
            (reason: unknown) => !cancelled && reportError(reason),
        );
        return () => {
            cancelled = true;
        };
    }, [mount, reportError]);

    // The route follows the props: a new insight or flow navigates AD once its identifiers resolve.
    const currentRouteKey = routeKey(props);
    const [route, setRoute] = useState<IResolvedRoute | null>(null);
    useEffect(() => {
        let cancelled = false;
        const latest = propsRef.current;
        resolveRouteIdentifiers(
            mount.backend,
            mount.workspace,
            latest.insight,
            latest.config ?? NO_CONFIG,
        ).then(
            (identifiers) => {
                if (!cancelled) {
                    setRoute({ key: currentRouteKey, identifiers });
                    setRouteError(null);
                }
            },
            (reason: unknown) => !cancelled && reportRouteError(reason),
        );
        return () => {
            cancelled = true;
        };
    }, [mount, currentRouteKey, reportRouteError]);

    // AD mounts only after the host data loads; the commands sent before that wait for it.
    const embeddedApiRef = useRef<IAdEmbeddedApi>(null);
    const pendingCommandsRef = useRef<Array<(api: IAdEmbeddedApi) => void>>([]);
    const runCommand = useCallback((command: (api: IAdEmbeddedApi) => void) => {
        if (embeddedApiRef.current) {
            command(embeddedApiRef.current);
        } else {
            pendingCommandsRef.current.push(command);
        }
    }, []);
    const failure = error ?? routeError;
    const isMounted = !!hostData && !!route && !failure;
    useEffect(() => {
        const api = embeddedApiRef.current;
        if (isMounted && api) {
            pendingCommandsRef.current.splice(0).forEach((command) => command(api));
        }
    }, [isMounted]);

    useImperativeHandle(
        props.apiRef,
        () => ({
            clear: () => runCommand((api) => api.clear()),
            requestCancellation: () => runCommand((api) => api.requestCancellation()),
            setFilterContext: (data, contextId) => runCommand((api) => api.setFilterContext(data, contextId)),
            sendCommand: (command) => runCommand((api) => api.sendCommand(command)),
            setApiToken: (body) => runCommand((api) => api.setApiToken(body)),
        }),
        [runCommand],
    );

    if (failure) {
        return renderSlot(props.slots?.Error, DefaultError, { error: failure });
    }

    if (!hostData || !route) {
        return renderSlot(props.slots?.Loading, DefaultLoading, {});
    }

    const callbacks = toEmbeddedCallbacks(props);

    return (
        <AnalyticalDesignerEmbedded
            config={toRouteConfig(route.identifiers, config)}
            host={{
                workspaceId: mount.workspace,
                bootstrapData: hostData.bootstrapData,
                featureFlags: hostData.settings,
                workspacePermissions: hostData.permissions,
                hostBackend: { instance: mount.backend, ...cacheReset },
                auth: props.auth,
                externalProviderId: props.externalProviderId,
                locale: config.locale,
                telemetryCallbacks: config.telemetryCallbacks,
                isReadOnly: config.isReadOnly,
            }}
            callbacks={callbacks}
            apiRef={embeddedApiRef}
            slots={props.slots}
        />
    );
}

/**
 * Analytical Designer as a React component.
 *
 * @remarks
 * Render it inside a `BackendProvider` and a `WorkspaceProvider`, or pass `backend` and `workspace`.
 * Import the stylesheets the package README lists. One instance can be mounted per page: mounting a
 * second one throws an error.
 *
 * @alpha
 */
export function AnalyticalDesigner(props: IAnalyticalDesignerProps): ReactElement {
    const { apiRef, ...rest } = props;
    const internalApiRef = useRef<IAnalyticalDesignerInternalApi>(null);

    useImperativeHandle(
        apiRef,
        () => ({
            clear: () => internalApiRef.current?.clear(),
            requestCancellation: () => internalApiRef.current?.requestCancellation(),
            setFilterContext: (data, contextId) => internalApiRef.current?.setFilterContext(data, contextId),
            sendCommand: (command) => internalApiRef.current?.sendCommand(command),
        }),
        [],
    );

    return <AnalyticalDesignerInternal {...rest} apiRef={internalApiRef} />;
}
