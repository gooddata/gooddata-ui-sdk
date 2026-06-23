// (C) 2026 GoodData Corporation

import { useMemo, useSyncExternalStore } from "react";

import { useLocation } from "react-router";

import { type ILocale, isLocale } from "@gooddata/sdk-model";
import { type IEffectiveSettings, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { isProduction } from "../lib/isProduction.js";
import { getApplicationScopeFromPath, getWorkspaceIdFromPath } from "../loader/routing.js";

import { getBackend } from "./backend.js";
import {
    type ILoadPlatformContextCallbacks,
    HostApplicationDisabledError,
    loadPlatformContext,
} from "./loadPlatformContext.js";
import {
    type IBackendPlatformContext,
    type IPlatformContextLoadResult,
    type IRoutePlatformContext,
} from "./types.js";
import { useWorkspaceColorPalette } from "./useWorkspaceColorPalette.js";
import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { useWorkspaceSettings } from "./useWorkspaceSettings.js";
import { useWorkspaceTheme } from "./useWorkspaceTheme.js";
import { shouldWaitForInjectedApiToken, waitForInjectedApiToken } from "./waitForInjectedApiToken.js";

function redirectToAppRoot(): void {
    const rootUrl = new URL("/", window.location.origin).toString();
    window.location.assign(rootUrl);
}

/**
 * Builds the platform context inside the host application.
 *
 * @remarks
 * This is intentionally host-owned and can evolve as host bootstrapping grows.
 *
 * @internal
 */
export function useLoadPlatformContext(): IPlatformContextLoadResult<IPlatformContext> {
    const backendContext = useSyncExternalStore(
        BackendPlatformContextProvider.subscribe,
        BackendPlatformContextProvider.getResult,
    );

    const { pathname } = useLocation();

    const applicationScope = getApplicationScopeFromPath(pathname);
    const workspaceId = getWorkspaceIdFromPath(pathname);
    const backend = backendContext.state === "ready" ? getBackend() : undefined;
    const workspacePermissionsState = useWorkspacePermissions(backend, workspaceId);
    const workspaceSettingsState = useWorkspaceSettings(backend, workspaceId);
    const workspaceColorPaletteState = useWorkspaceColorPalette(backend, workspaceId);
    const workspaceThemeState = useWorkspaceTheme(backend, workspaceId);

    return useMemo(() => {
        if (backendContext.state !== "ready") {
            return backendContext;
        }

        // Block rendering until workspace permissions, settings AND theme are available when inside a
        // workspace route. The theme is gated so content never paints with the bootstrap/default theme
        // first and then re-themes once the workspace theme resolves (the visible theme flash, LX-2608).
        // Only `loading`/`idle` block; `forbidden`/`error` are terminal, so a missing or failed theme
        // still renders (falling back to the bootstrap theme below) rather than hanging on the loader.
        const permissionsLoading =
            workspacePermissionsState.state === "loading" || workspacePermissionsState.state === "idle";
        const settingsLoading =
            workspaceSettingsState.state === "loading" || workspaceSettingsState.state === "idle";
        const themeLoading = workspaceThemeState.state === "loading" || workspaceThemeState.state === "idle";

        if (workspaceId !== undefined && (permissionsLoading || settingsLoading || themeLoading)) {
            return { state: "loading" };
        }

        // Surface fetch failures so the user sees an error rather than a silent 404
        if (workspaceId !== undefined && workspacePermissionsState.state === "error") {
            return { state: "error", error: workspacePermissionsState.error };
        }
        if (workspaceId !== undefined && workspaceSettingsState.state === "error") {
            return { state: "error", error: workspaceSettingsState.error };
        }

        const workspacePermissions =
            workspacePermissionsState.state === "ready" ? workspacePermissionsState.permissions : undefined;
        const workspaceSettings =
            workspaceSettingsState.state === "ready" ? workspaceSettingsState.settings : undefined;
        const colorPalette =
            workspaceColorPaletteState.state === "ready"
                ? workspaceColorPaletteState.colorPalette
                : undefined;
        const workspaceTheme = workspaceThemeState.state === "ready" ? workspaceThemeState.theme : undefined;
        const effectiveTheme = workspaceTheme ?? backendContext.ctx.theme;

        const settings: IEffectiveSettings = workspaceSettings ?? backendContext.ctx.userSettings;

        const preferredLocale: ILocale | undefined = isLocale(settings.locale) ? settings.locale : undefined;

        const routeCtx: IRoutePlatformContext = {
            currentApplicationScope: applicationScope,
            currentWorkspaceId: workspaceId,
            workspacePermissions,
            workspaceSettings,
            colorPalette,
            settings,
            preferredLocale,
        };

        return { state: "ready", ctx: { ...backendContext.ctx, ...routeCtx, theme: effectiveTheme } };
    }, [
        backendContext,
        applicationScope,
        workspaceId,
        workspacePermissionsState,
        workspaceSettingsState,
        workspaceColorPaletteState,
        workspaceThemeState,
    ]);
}

/**
 * Subscribable provider of the host's backend platform context (org / user / settings).
 *
 * @internal
 */
export interface IBackendPlatformContextProvider {
    setCallbacks(callbacks: ILoadPlatformContextCallbacks): void;
    getResult: () => Readonly<IPlatformContextLoadResult<IBackendPlatformContext>>;
    subscribe: (listener: () => void) => () => void;
    load: () => Promise<void>;
}

class BackendPlatformContextProviderClass implements IBackendPlatformContextProvider {
    private _loadingStateMemo: IPlatformContextLoadResult<IBackendPlatformContext> = { state: "loading" };

    private _result: IPlatformContextLoadResult<IBackendPlatformContext> = this._loadingStateMemo;
    private _abortController = new AbortController();
    private _listeners = new Set<() => void>();
    private _loadStarted = false;
    private _callbacks: ILoadPlatformContextCallbacks | undefined;

    public setCallbacks(callbacks: ILoadPlatformContextCallbacks): void {
        this._callbacks = callbacks;
    }

    public getResult = (): Readonly<IPlatformContextLoadResult<IBackendPlatformContext>> => this._result;

    public subscribe = (listener: () => void): (() => void) => {
        if (!this._loadStarted) {
            void this.load();
        }
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    };

    public load = async () => {
        this._loadStarted = true;
        this._abortController.abort();
        const keepCurrentContextMounted = this._result.state === "ready";
        if (!keepCurrentContextMounted) {
            this._setResult(this._loadingStateMemo);
        }
        this._abortController = new AbortController();

        try {
            if (shouldWaitForInjectedApiToken()) {
                await waitForInjectedApiToken(this._abortController.signal);
            }
            const ctx = await loadPlatformContext({
                signal: this._abortController.signal,
                callbacks: this._callbacks,
            });
            if (!this._abortController.signal.aborted) {
                this._setResult({ state: "ready", ctx });
            }
        } catch (e) {
            if (e instanceof HostApplicationDisabledError && isProduction) {
                redirectToAppRoot(); // In dev env, this would just loop due to app routing
                return;
            }
            if (e instanceof DOMException && e.name === "AbortError") {
                return;
            }
            console.error("[host-runtime/platform-context] Failed to load platform context.", e);
            const message = e instanceof Error ? e.message : "Unknown platform context error.";
            if (!this._abortController.signal.aborted) {
                this._setResult({ state: "error", error: message });
            }
        }
    };

    private _setResult(value: IPlatformContextLoadResult<IBackendPlatformContext>): void {
        this._result = value;
        this._listeners.forEach((listener) => listener());
    }
}

/**
 * @internal
 */
export const BackendPlatformContextProvider: IBackendPlatformContextProvider =
    new BackendPlatformContextProviderClass();

/**
 * Registers the host's platform-context lifecycle callbacks. Must be called once at
 * host boot before `<Root>` is rendered so the very first load can report telemetry
 * / errors back to the host application.
 *
 * @alpha
 */
export function registerPlatformContextCallbacks(callbacks: ILoadPlatformContextCallbacks): void {
    BackendPlatformContextProvider.setCallbacks(callbacks);
}
