// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Module mocks are hoisted before imports by vitest.
vi.mock("@gooddata/sdk-ui", () => ({
    useBackendStrict: vi.fn(() => ({})),
    useWorkspaceStrict: vi.fn(() => "test-workspace"),
}));

vi.mock("../hooks/useCatalogItemLoad.js", () => ({
    useCatalogItemLoad: vi.fn().mockReturnValue({ status: "success", item: undefined }),
}));

vi.mock("../../catalogItem/query.js", () => ({
    updateCatalogItem: vi.fn().mockResolvedValue(undefined),
    updateCatalogItemCertification: vi.fn().mockResolvedValue(undefined),
}));

import type { ICatalogItem, ICatalogItemRef } from "../../catalogItem/types.js";
import { useCatalogItemLoad } from "../hooks/useCatalogItemLoad.js";
import { useCatalogItemUpdate } from "../hooks/useCatalogItemUpdate.js";

const mockedLoad = vi.mocked(useCatalogItemLoad);

const itemA: ICatalogItem = {
    type: "parameter",
    identifier: "param.id",
    title: "Param A",
    description: "Description A",
    tags: [],
    createdBy: "",
    updatedBy: "",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 1 },
};

const itemB: ICatalogItem = {
    ...itemA,
    title: "Param B",
    description: "Description B",
    definition: { type: "NUMBER", defaultValue: 99 },
};

describe("useCatalogItemUpdate – objectDefinition resync", () => {
    it("item updates immediately when parent provides a newer loaded objectDefinition with the same identity", () => {
        // Simulate useCatalogItemLoad returning the original item and not re-running
        // when objectDefinition changes (same id/type/filled – deps are unchanged).
        mockedLoad.mockReturnValue({ status: "success", item: itemA });

        const { result, rerender } = renderHook(
            ({ objectDefinition }: { objectDefinition: ICatalogItem | null }) =>
                useCatalogItemUpdate({ currentUser: null, objectDefinition }),
            { initialProps: { objectDefinition: itemA } },
        );

        expect(result.current.item).toEqual(itemA);

        // Simulate Main calling setItemOpened(itemB) after a dialog save.
        // The loadedItem effect does NOT fire (useCatalogItemLoad is still returning itemA),
        // but the objectDefinition effect should sync item to itemB immediately.
        rerender({ objectDefinition: itemB });

        expect(result.current.item).toEqual(itemB);
    });

    it("item is not overwritten when parent passes a non-loaded ref as objectDefinition", () => {
        mockedLoad.mockReturnValue({ status: "success", item: itemA });

        const ref: ICatalogItemRef = { identifier: "param.id", type: "parameter" };

        const { result, rerender } = renderHook(
            ({ objectDefinition }: { objectDefinition: ICatalogItem | ICatalogItemRef | null }) =>
                useCatalogItemUpdate({ currentUser: null, objectDefinition }),
            { initialProps: { objectDefinition: itemA as ICatalogItem | ICatalogItemRef } },
        );

        expect(result.current.item).toEqual(itemA);

        // Pass a bare ref (no title → isCatalogItemLoaded returns false); item should not change.
        rerender({ objectDefinition: ref });

        expect(result.current.item).toEqual(itemA);
    });
});
