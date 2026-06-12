// (C) 2026 GoodData Corporation

import { type APIResponse, type Page, type Route } from "@playwright/test";

/**
 * @internal
 * Injects Authorization bearer token into all /api/ requests via Playwright route interception.
 */
export async function injectAuthHeader(page: Page, token: string): Promise<void> {
    await page.unroute("**/api/**");
    await page.route("**/api/**", async (route) => {
        const headers = {
            ...route.request().headers(),
            authorization: `Bearer ${token}`,
        };
        await route.fallback({ headers });
    });
}

/**
 * @internal
 */
export const authHeader = (token: string) => ({ authorization: `Bearer ${token}` });

/**
 * @internal
 * route.fetch() re-issues a request without going through injectAuthHeader's fallback, so a
 * harness authenticated by token/header only (no cookie) would get an unauthenticated redirect.
 * Use this in route interceptors that re-fetch /api requests to keep the token attached.
 */
export function authedRouteFetch(route: Route, token: string): Promise<APIResponse> {
    return route.fetch({ headers: { ...route.request().headers(), ...authHeader(token) } });
}
