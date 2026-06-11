// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";
import { getElementTitle } from "../getElementTitle.js";

function createContext(items: Array<{ title: string | null }>): DashboardContext {
    const queryBuilder = {
        withLimit: () => queryBuilder,
        withOptions: () => queryBuilder,
        query: () => Promise.resolve({ items }),
    };

    const backend = {
        capabilities: { supportsElementUris: false },
        workspace: () => ({
            attributes: () => ({
                elements: () => ({ forDisplayForm: () => queryBuilder }),
            }),
        }),
    };

    return { backend } as unknown as DashboardContext;
}

describe("getElementTitle", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the title of the matched element", async () => {
        const ctx = createContext([{ title: "Closed" }]);

        await expect(getElementTitle("ws", idRef("status"), "primary-value", ctx)).resolves.toBe("Closed");
    });

    it("throws a descriptive error (naming the display form and value) when no element matches", async () => {
        // Regression guard: previously `items[0].title` threw a raw "Cannot read properties of undefined"
        // TypeError; now it fails with a message that makes the "Failed to load URL" diagnosable.
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const ctx = createContext([]);

        await expect(getElementTitle("ws", idRef("report_id"), "670030448", ctx)).rejects.toThrow(
            /report_id.*670030448/,
        );
    });
});
