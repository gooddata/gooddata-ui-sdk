// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createElement } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import type { ShareableCatalogItem } from "./types.js";
import { useShareableLabels } from "./useShareableLabels.js";

/**
 * The hook talks to the backend through the real providers on purpose: mocking
 * `@gooddata/sdk-ui` module-wide leaks into every other test file once the suite
 * runs without isolation, so the attribute fetch is steered by this stub instead.
 */
function createBackend(getAttribute: () => Promise<unknown>): IAnalyticalBackend {
    return {
        workspace: () => ({
            attributes: () => ({ getAttribute }),
        }),
    } as unknown as IAnalyticalBackend;
}

function createWrapper(getAttribute: () => Promise<unknown>) {
    const backend = createBackend(getAttribute);

    return ({ children }: PropsWithChildren) =>
        createElement(
            BackendProvider,
            { backend },
            createElement(WorkspaceProvider, { workspace: "test-workspace" }, children),
        );
}

const neverSettles = () => new Promise<never>(() => {});

const itemBase = {
    description: "",
    tags: [] as string[],
    createdBy: "",
    updatedBy: "",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

const fact: ShareableCatalogItem = {
    ...itemBase,
    type: "fact",
    identifier: "fact.revenue",
    title: "Revenue",
};
const attribute: ShareableCatalogItem = {
    ...itemBase,
    type: "attribute",
    identifier: "attr.region",
    title: "Region",
};
const measure: ShareableCatalogItem = {
    ...itemBase,
    type: "measure",
    identifier: "metric.revenue",
    title: "Revenue metric",
};

describe("useShareableLabels", () => {
    it("reports a fact as not loading with no labels (no fetch)", () => {
        // A fact never fetches, so useCancelablePromise sits at "pending" forever —
        // but the hook must not treat that as loading, or Add would stay disabled.
        const { result } = renderHook(() => useShareableLabels(fact), {
            wrapper: createWrapper(neverSettles),
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.labels).toEqual([]);
    });

    it("reports a measure as not loading with no labels (no fetch)", () => {
        const { result } = renderHook(() => useShareableLabels(measure), {
            wrapper: createWrapper(neverSettles),
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.labels).toEqual([]);
    });

    it("reports an attribute as loading until its fetch settles", () => {
        const { result } = renderHook(() => useShareableLabels(attribute), {
            wrapper: createWrapper(neverSettles),
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.labels).toEqual([]);
    });

    it("maps display forms and stops loading once the attribute resolves", async () => {
        const getAttribute = () =>
            Promise.resolve({
                displayForms: [
                    { ref: idRef("attr.region.name"), title: "Name", isPrimary: true, isDefault: false },
                    { ref: idRef("attr.region.code"), title: "Code", isPrimary: false, isDefault: true },
                ],
            });

        const { result } = renderHook(() => useShareableLabels(attribute), {
            wrapper: createWrapper(getAttribute),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(false);
        expect(result.current.labels).toEqual([
            {
                ref: idRef("attr.region.name"),
                id: "attr.region.name",
                title: "Name",
                isPrimary: true,
                isDefault: false,
            },
            {
                ref: idRef("attr.region.code"),
                id: "attr.region.code",
                title: "Code",
                isPrimary: false,
                isDefault: true,
            },
        ]);
    });

    it("stops loading on a failed attribute fetch so Add isn't stuck disabled", async () => {
        const { result } = renderHook(() => useShareableLabels(attribute), {
            wrapper: createWrapper(() => Promise.reject(new Error("fetch failed"))),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(true);
        expect(result.current.labels).toEqual([]);
    });
});
