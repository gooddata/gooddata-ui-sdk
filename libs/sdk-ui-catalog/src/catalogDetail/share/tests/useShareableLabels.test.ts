// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

// Module mocks are hoisted before imports by vitest.
vi.mock("@gooddata/sdk-ui", () => ({
    useBackendStrict: vi.fn(() => ({})),
    useWorkspaceStrict: vi.fn(() => "test-workspace"),
    useCancelablePromise: vi.fn(),
}));

import { type UseCancelablePromiseStatus, useCancelablePromise } from "@gooddata/sdk-ui";

import type { ShareableCatalogItem } from "../types.js";
import { useShareableLabels } from "../useShareableLabels.js";

const mockedPromise = vi.mocked(useCancelablePromise);

function mockPromise(status: UseCancelablePromiseStatus, result?: unknown) {
    mockedPromise.mockReturnValue({ status, result, error: undefined } as ReturnType<
        typeof useCancelablePromise
    >);
}

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

describe("useShareableLabels", () => {
    it("reports a fact as not loading with no labels (no fetch)", () => {
        // A fact never fetches, so useCancelablePromise sits at "pending" forever —
        // but the hook must not treat that as loading, or Add would stay disabled.
        mockPromise("pending");

        const { result } = renderHook(() => useShareableLabels(fact));

        expect(result.current.loading).toBe(false);
        expect(result.current.labels).toEqual([]);
    });

    it("reports an attribute as loading until its fetch settles", () => {
        mockPromise("loading");

        const { result } = renderHook(() => useShareableLabels(attribute));

        expect(result.current.loading).toBe(true);
        expect(result.current.labels).toEqual([]);
    });

    it("maps display forms and stops loading once the attribute resolves", () => {
        mockPromise("success", {
            displayForms: [
                { ref: idRef("attr.region.name"), title: "Name", isPrimary: true, isDefault: false },
                { ref: idRef("attr.region.code"), title: "Code", isPrimary: false, isDefault: true },
            ],
        });

        const { result } = renderHook(() => useShareableLabels(attribute));

        expect(result.current.loading).toBe(false);
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

    it("stops loading on a failed attribute fetch so Add isn't stuck disabled", () => {
        mockPromise("error");

        const { result } = renderHook(() => useShareableLabels(attribute));

        expect(result.current.loading).toBe(false);
        expect(result.current.labels).toEqual([]);
    });
});
