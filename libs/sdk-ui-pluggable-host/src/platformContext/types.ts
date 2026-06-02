// (C) 2026 GoodData Corporation

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

export interface IPlatformContextLoadingResult {
    state: "loading";
}

export interface IPlatformContextReadyResult<TContext> {
    state: "ready";
    ctx: TContext;
}

export interface IPlatformContextErrorResult {
    state: "error";
    error: string;
}

type RoutePlatformContextFields =
    | "currentWorkspaceId"
    | "currentApplicationScope"
    | "workspacePermissions"
    | "workspaceSettings"
    | "colorPalette"
    | "settings"
    | "preferredLocale";

export type IRoutePlatformContext = Pick<IPlatformContext, RoutePlatformContextFields>;
export type IBackendPlatformContext = Omit<IPlatformContext, RoutePlatformContextFields>;

export type IPlatformContextLoadResult<TContext> =
    | IPlatformContextLoadingResult
    | IPlatformContextReadyResult<TContext>
    | IPlatformContextErrorResult;
