// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export const GOODMOCK_HOST = process.env["GOODMOCK_HOST"] || "";
/**
 * @internal
 */
export const API_TOKEN = process.env["TIGER_API_TOKEN"] ?? "";
/**
 * @internal
 */
export const BACKEND_HOST = process.env["HOST"] || "";

/**
 * @internal
 */
export const getEnvWithFallback = (env: string, fallback = "") => process.env[env] || fallback;

/**
 * @internal
 */
export const getBaseUrl = (defaultValue = "") => getEnvWithFallback("BASE_URL", defaultValue);
/**
 * @internal
 */
export const getWorkspaceId = (defaultValue = "") => getEnvWithFallback("TEST_WORKSPACE_ID", defaultValue);
