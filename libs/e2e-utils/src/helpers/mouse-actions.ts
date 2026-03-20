// (C) 2026 GoodData Corporation

import { type Locator, type Page } from "@playwright/test";

/**
 * Click at the center of the bounding box of the given locator.
 * Throws if the element is not visible (no bounding box).
 * Allows to use mouse up and down instead of click for some fragile cases.
 */
export async function clickByBoundingBox(
    page: Page,
    locator: Locator,
    options?: { useMouseUpDown?: boolean; steps?: number; timeout?: number },
): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error("Element not visible");

    if (options?.useMouseUpDown) {
        const steps = options?.steps ?? 5;
        const timeout = options?.timeout ?? 0;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
        await page.mouse.down();
        await page.waitForTimeout(timeout);
        await page.mouse.up();
    } else {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
}

/**
 * Hover (move mouse) to the center of the bounding box of the given locator.
 * Throws if the element is not visible (no bounding box).
 */
export async function hoverByBoundingBox(
    page: Page,
    locator: Locator,
    options?: { steps?: number },
): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error("Element not visible");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, options);
}
