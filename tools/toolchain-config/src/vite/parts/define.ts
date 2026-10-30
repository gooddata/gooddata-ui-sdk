// (C) 2026 GoodData Corporation

/**
 * The string `"undefined"`, not the literal: Vite skips a define whose value is the literal undefined,
 * which would leave the bare identifier a ReferenceError at runtime.
 */
export const UNDEFINED_DEFINE = "undefined";

/**
 * A compile-time global carrying an env value in development and `undefined` in production.
 */
export function envStringDefine(env: Record<string, string>, key: string, isProduction: boolean): string {
    return isProduction || !env[key] ? UNDEFINED_DEFINE : JSON.stringify(env[key]);
}

/**
 * Options for {@link harnessDefines}.
 */
export interface IHarnessDefinesOptions {
    env: Record<string, string>;
    isProduction: boolean;

    /**
     * Compile-time global carrying the module's dev remote URL, e.g. `CATALOG_REMOTE_URL`.
     */
    remoteUrlEnvVar: string;
}

/**
 * The compile-time globals every harness defines: the API token for dev, the production flag, the
 * remote URL of the module under development, and the legacy app globals the SDK reads.
 */
export function harnessDefines({
    env,
    isProduction,
    remoteUrlEnvVar,
}: IHarnessDefinesOptions): Record<string, string> {
    return {
        TIGER_API_TOKEN: envStringDefine(env, "TIGER_API_TOKEN", isProduction),
        PRODUCTION: JSON.stringify(isProduction),
        [remoteUrlEnvVar]: envStringDefine(env, remoteUrlEnvVar, isProduction),
        "process.env": JSON.stringify({}),
        REACT_APP_API_TOKEN: envStringDefine(env, "TIGER_API_TOKEN", isProduction),
        REACT_APP_IN_AIO: JSON.stringify(false),
    };
}

/**
 * The compile-time globals every module federation remote defines.
 */
export function moduleDefines(mode: string): Record<string, string> {
    return {
        PRODUCTION: JSON.stringify(mode === "production"),
        "process.env": JSON.stringify({}),
    };
}
