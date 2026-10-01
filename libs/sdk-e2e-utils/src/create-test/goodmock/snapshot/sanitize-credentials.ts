// (C) 2026 GoodData Corporation

import { type IGoodmockMapping } from "../types.js";

/** Sanitize credentials (login cookie, resolveSettings map tokens) in place. */
export function sanitizeCredentials(mappings: IGoodmockMapping[]): void {
    for (const mapping of mappings) {
        if (mapping?.request?.url === "/gdc/account/login") {
            delete mapping.request.bodyPatterns;
            if (mapping.response.headers) {
                delete mapping.response.headers["Set-Cookie"];
            }
        }

        // Sanitize secrets from resolveSettings responses. Match both org-level
        // (/api/v1/actions/resolveSettings) and workspace-level variants, via either `url`
        // (no query) or `urlPath` (with query params).
        const requestPath = mapping?.request?.url ?? mapping?.request?.urlPath;
        if (typeof requestPath === "string" && requestPath.includes("/resolveSettings")) {
            try {
                type SettingItem = { id?: string; content?: Record<string, unknown> };
                const body = mapping?.response?.jsonBody;
                const settings: SettingItem[] | null = Array.isArray(body)
                    ? (body as SettingItem[])
                    : Array.isArray((body as { data?: unknown })?.data)
                      ? (body as { data: SettingItem[] }).data
                      : null;
                if (settings) {
                    for (const setting of settings) {
                        const content = setting?.content;
                        if (!content || typeof content !== "object") {
                            continue;
                        }
                        // Map tokens (agGrid, mapbox) are stored under content.value.
                        if (setting?.id === "agGridToken" || setting?.id === "mapboxToken") {
                            content["value"] = "";
                        }
                    }
                }
            } catch {
                console.warn(
                    `sanitizeCredentials – resolveSettings body is not valid JSON for: ${requestPath}`,
                );
            }
        }
    }
}
