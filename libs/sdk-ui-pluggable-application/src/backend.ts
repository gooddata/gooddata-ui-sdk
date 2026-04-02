// (C) 2026 GoodData Corporation

import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    ContextDeferredAuthProvider,
    TigerTokenAuthProvider,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { type IAuthCredentials } from "@gooddata/sdk-pluggable-application-model";

/**
 * Options for {@link createBackendForModule}.
 *
 * @alpha
 */
export interface ICreateBackendForModuleOptions {
    /**
     * Package name reported to the backend for telemetry.
     */
    packageName: string;

    /**
     * Package version reported to the backend for telemetry.
     */
    packageVersion?: string;
}

/**
 * Creates an analytical backend instance from the platform context auth credentials.
 *
 * @remarks
 * Each pluggable application module should create its own backend instance using this
 * function rather than sharing the host's internal backend singleton. This ensures
 * modules remain decoupled and avoids SDK version desync between independently built
 * artifacts.
 *
 * @example
 * ```tsx
 * import { createBackendForModule } from "@gooddata/sdk-ui-pluggable-application";
 *
 * function MyApp({ ctx }: { ctx: IPlatformContext }) {
 *     const backend = useMemo(
 *         () => createBackendForModule(ctx.auth, { packageName: "my-module" }),
 *         [ctx.auth],
 *     );
 *     // use backend...
 * }
 * ```
 *
 * @alpha
 */
export function createBackendForModule(
    auth: IAuthCredentials,
    options: ICreateBackendForModuleOptions,
): IAnalyticalBackend {
    const base = tigerFactory(undefined, {
        packageName: options.packageName,
        packageVersion: options.packageVersion ?? "unknown",
    });
    switch (auth.type) {
        case "apiToken":
        case "jwt":
            return withCaching(
                base.withAuthentication(new TigerTokenAuthProvider(auth.token)),
                RecommendedCachingConfiguration,
            );
        case "contextDeferred":
            return withCaching(
                base.withAuthentication(new ContextDeferredAuthProvider()),
                RecommendedCachingConfiguration,
            );
        default: {
            throw new Error(
                `[sdk-ui-pluggable-application/backend] Unsupported auth type "${String((auth as { type?: unknown }).type)}".`,
            );
        }
    }
}
