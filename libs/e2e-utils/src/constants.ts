// (C) 2026 GoodData Corporation

export const GOODMOCK_HOST = process.env["GOODMOCK_HOST"] || "";
export const API_TOKEN = process.env["TIGER_API_TOKEN"] ?? "";
export const BACKEND_HOST = process.env["HOST"] || "";

export const getEnvWithFallback = (env: string, fallback = "") => process.env[env] || fallback;

export const getBaseUrl = (defaultValue = "") => getEnvWithFallback("BASE_URL", defaultValue);
export const getWorkspaceId = (defaultValue = "") => getEnvWithFallback("TEST_WORKSPACE_ID", defaultValue);
