// (C) 2026 GoodData Corporation

import { type ElementHandle, type Page, expect } from "@playwright/test";

export async function getCustomElementHandle(
    page: Page,
    selector: string,
): Promise<ElementHandle<HTMLElement>> {
    const handle = await page.locator(selector).elementHandle();

    if (!handle) {
        throw new Error(`Custom element "${selector}" was not found.`);
    }

    return handle as ElementHandle<HTMLElement>;
}

export async function setCustomElementProperties(
    page: Page,
    selector: string,
    snapshot: Record<string, unknown>,
): Promise<void> {
    await page.locator(selector).evaluate((element, properties) => {
        Object.assign(element as unknown as Record<string, unknown>, properties);
    }, snapshot);
}

export async function callCustomElementMethod<T = unknown>(
    page: Page,
    selector: string,
    method: string,
    args: unknown[] = [],
): Promise<T> {
    return page.locator(selector).evaluate(
        async (element, { methodName, methodArgs }) => {
            const method = (element as unknown as Record<string, (...args: unknown[]) => unknown>)[
                methodName
            ];

            if (typeof method !== "function") {
                throw new Error(`Custom element method "${methodName}" is not available.`);
            }

            return method.apply(element, methodArgs);
        },
        {
            methodName: method,
            methodArgs: args,
        },
    ) as Promise<T>;
}

export async function waitForCustomElementReady(page: Page): Promise<void> {
    await expect(page.locator(".s-wc-ready-count")).toHaveText("1", {
        timeout: 60_000,
    });
    await expect(page.locator(".s-wc-last-error")).toHaveText("");
}

export async function getScenarioText(page: Page, selector: string): Promise<string> {
    return (await page.locator(selector).textContent())?.trim() ?? "";
}
