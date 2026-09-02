// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createElement } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import type { ICatalogItem, ICatalogItemMeasure, ICatalogItemRef } from "../catalogItem/types.js";
import { PermissionsProvider } from "../permission/PermissionsContext.js";
import type { PermissionsState } from "../permission/types.js";

import { useCatalogItemUpdate } from "./hooks/useCatalogItemUpdate.js";

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

const measureWithPermissions: ICatalogItemMeasure = {
    type: "measure",
    identifier: "metric.id",
    title: "Metric A",
    description: "Description A",
    tags: [],
    createdBy: "",
    updatedBy: "",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    permissions: ["EDIT"],
};

/**
 * The parameter as the backend returns it — `convertParameterToCatalogItem` turns this into
 * {@link itemA}. Steering the load through the backend rather than mocking `useCatalogItemLoad`
 * keeps this file runnable without per-file isolation: the hook module is loaded unmocked by the
 * detail component's tests, and a `vi.mock` cannot be applied to a module graph they already
 * evaluated.
 */
const parameterEntity = {
    type: "parameter",
    ref: idRef(itemA.identifier, "parameter"),
    id: itemA.identifier,
    title: itemA.title,
    description: itemA.description,
    tags: itemA.tags,
    definition: itemA.definition,
};

function createWrapper(
    getParameter = vi.fn().mockResolvedValue(parameterEntity),
    {
        getMeasure = vi.fn(),
        enableMetricPermissions = false,
    }: { getMeasure?: ReturnType<typeof vi.fn>; enableMetricPermissions?: boolean } = {},
) {
    const backend = {
        workspace: () => ({
            parameters: () => ({ getParameter }),
            measures: () => ({ getMeasure }),
        }),
    } as unknown as IAnalyticalBackend;

    // the load hook reads feature flags off the permissions context
    const permissionsState = {
        status: "success",
        result: { settings: { enableMetricPermissions } },
    } as PermissionsState;

    function wrapper({ children }: PropsWithChildren) {
        return createElement(
            BackendProvider,
            { backend },
            createElement(
                WorkspaceProvider,
                { workspace: "test-workspace" },
                createElement(PermissionsProvider, { permissionsState }, children),
            ),
        );
    }

    return { wrapper, getParameter, getMeasure };
}

describe("useCatalogItemUpdate – objectDefinition resync", () => {
    it("item updates immediately when parent provides a newer loaded objectDefinition with the same identity", async () => {
        const { wrapper, getParameter } = createWrapper();

        const { result, rerender } = renderHook(
            ({ objectDefinition }: { objectDefinition: ICatalogItem | null }) =>
                useCatalogItemUpdate({ currentUser: null, objectDefinition }),
            { initialProps: { objectDefinition: itemA }, wrapper },
        );

        // An already-loaded objectDefinition is reused as-is; nothing is fetched.
        await waitFor(() => {
            expect(result.current.item).toEqual(itemA);
        });
        expect(getParameter).not.toHaveBeenCalled();

        // Simulate Main calling setItemOpened(itemB) after a dialog save. useCatalogItemLoad does
        // not re-run (same id/type/filled, so its deps are unchanged) and keeps returning itemA,
        // but the objectDefinition effect should sync item to itemB immediately.
        rerender({ objectDefinition: itemB });

        expect(result.current.item).toEqual(itemB);
    });

    it("item is not overwritten with a non-loaded ref passed as objectDefinition", async () => {
        const { wrapper } = createWrapper();

        const { result, rerender } = renderHook(
            ({ objectDefinition }: { objectDefinition: ICatalogItem | ICatalogItemRef | null }) =>
                useCatalogItemUpdate({ currentUser: null, objectDefinition }),
            { initialProps: { objectDefinition: itemA as ICatalogItem | ICatalogItemRef }, wrapper },
        );

        await waitFor(() => {
            expect(result.current.item).toEqual(itemA);
        });

        // A bare ref has no title, so isCatalogItemLoaded() is false and the objectDefinition
        // effect must leave item alone; the hook loads the full item from the backend instead.
        const ref: ICatalogItemRef = { identifier: itemA.identifier, type: itemA.type };
        rerender({ objectDefinition: ref });

        expect(result.current.item).not.toEqual(ref);
        await waitFor(() => {
            expect(result.current.item).toEqual(itemA);
        });
    });
});

describe("useCatalogItemUpdate – applyItemUpdate / applyItemDelete", () => {
    it("applyItemUpdate syncs local item and forwards to onUpdate", async () => {
        const { wrapper } = createWrapper();
        const onUpdate = vi.fn();

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectId: itemA.identifier,
                    objectType: itemA.type,
                    onUpdate,
                }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.item).toEqual(itemA);
        });

        act(() => {
            result.current.applyItemUpdate(itemB);
        });

        expect(result.current.item).toEqual(itemB);
        expect(onUpdate).toHaveBeenCalledWith(itemB);
    });

    it("applyItemUpdate keeps the metric's permissions the update response cannot return", async () => {
        const { wrapper } = createWrapper();
        const onUpdate = vi.fn();

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectDefinition: measureWithPermissions,
                    onUpdate,
                }),
            { wrapper },
        );

        // the load settles the item once more, so acting sooner would race it
        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(result.current.item).toEqual(measureWithPermissions);

        const saved: ICatalogItemMeasure = { ...measureWithPermissions, title: "Metric B" };
        delete saved.permissions;

        act(() => {
            result.current.applyItemUpdate(saved);
        });

        const expected = { ...saved, permissions: measureWithPermissions.permissions };
        expect(result.current.item).toEqual(expected);
        expect(onUpdate).toHaveBeenCalledWith(expected);
    });

    it("applyItemUpdate prefers the permissions the update did return", async () => {
        const { wrapper } = createWrapper();

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectDefinition: measureWithPermissions,
                }),
            { wrapper },
        );

        // the load settles the item once more, so acting sooner would race it
        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(result.current.item).toEqual(measureWithPermissions);

        const saved: ICatalogItemMeasure = { ...measureWithPermissions, permissions: ["VIEW"] };
        act(() => {
            result.current.applyItemUpdate(saved);
        });

        expect(result.current.item).toEqual(saved);
    });

    it("applyItemDelete clears local item and forwards to onDelete", async () => {
        const { wrapper } = createWrapper();
        const onDelete = vi.fn();

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectId: itemA.identifier,
                    objectType: itemA.type,
                    onDelete,
                }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.item).toEqual(itemA);
        });

        const ref: ICatalogItemRef = { identifier: itemA.identifier, type: itemA.type };
        act(() => {
            result.current.applyItemDelete(ref);
        });

        expect(result.current.item).toBeNull();
        expect(onDelete).toHaveBeenCalledWith(ref);
    });
});

describe("useCatalogItemUpdate – a supplied metric that carries no permissions", () => {
    const measureWithoutPermissions: ICatalogItemMeasure = {
        ...measureWithPermissions,
        permissions: undefined,
    };

    /** The same metric as the backend returns it, with the permissions only a fetch can bring. */
    const measureEntity = {
        type: "measure",
        id: measureWithPermissions.identifier,
        ref: idRef(measureWithPermissions.identifier, "measure"),
        title: measureWithPermissions.title,
        description: measureWithPermissions.description,
        tags: [],
        format: "",
        expression: "SELECT 1",
        permissions: ["EDIT"],
        production: true,
        deprecated: false,
        unlisted: false,
    };

    it("fetches it for its permissions when they are enabled", async () => {
        const { wrapper, getMeasure } = createWrapper(undefined, {
            getMeasure: vi.fn().mockResolvedValue(measureEntity),
            enableMetricPermissions: true,
        });

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectDefinition: measureWithoutPermissions,
                }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });

        expect(getMeasure).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ loadPermissions: true }),
        );
        expect(result.current.item).toMatchObject({ permissions: ["EDIT"] });
    });

    it("is reused as it is when they are disabled", async () => {
        const { wrapper, getMeasure } = createWrapper(undefined, { enableMetricPermissions: false });

        const { result } = renderHook(
            () =>
                useCatalogItemUpdate({
                    currentUser: null,
                    objectDefinition: measureWithoutPermissions,
                }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });

        expect(getMeasure).not.toHaveBeenCalled();
        expect(result.current.item).toEqual(measureWithoutPermissions);
    });
});
