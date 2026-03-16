// (C) 2026 GoodData Corporation

import { type Page } from "@playwright/test";

/**
 * Injects Authorization bearer token into all /api/ requests via Playwright route interception.
 */
export async function injectAuthHeader(page: Page, token: string): Promise<void> {
    await page.route("**/api/**", async (route) => {
        const headers = {
            ...route.request().headers(),
            authorization: `Bearer ${token}`,
        };
        await route.fallback({ headers });
    });
}

export const authHeader = (token: string) => ({ authorization: `Bearer ${token}` });
