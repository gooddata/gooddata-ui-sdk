// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createElement } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IUser,
    type IWorkspacePermissions,
    idRef,
    newInsightDefinition,
} from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, isNotFound } from "@gooddata/sdk-ui";

import { createLabel } from "../../catalogItem/testFixtures.js";
import type { ICatalogItemAttribute, ICatalogItemInsight } from "../../catalogItem/types.js";
import { PermissionsProvider } from "../../permission/PermissionsContext.js";
import type { PermissionsState } from "../../permission/types.js";

import { useCatalogItemLoad } from "./useCatalogItemLoad.js";

const label = createLabel("label.name", "Region Name");

const attributeEntity = {
    type: "attribute" as const,
    ref: idRef("attribute.id", "attribute"),
    id: "attribute.id",
    title: "Region",
    description: "",
    tags: [],
    isLocked: false,
    displayForms: [label],
};

const listItem: ICatalogItemAttribute = {
    identifier: "attribute.id",
    type: "attribute",
    title: "Region",
    description: "",
    tags: [],
    createdBy: "",
    createdAt: null,
    updatedBy: "",
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

function createWrapper(getAttribute = vi.fn().mockResolvedValue(attributeEntity)) {
    const backend = {
        workspace: () => ({ attributes: () => ({ getAttribute }) }),
    } as unknown as IAnalyticalBackend;
    const permissionsState = { status: "success", result: { settings: {} } } as PermissionsState;

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
    return { wrapper, getAttribute };
}

describe("useCatalogItemLoad – attribute labels", () => {
    it("refetches an attribute handed over without labels, since list queries do not include them", async () => {
        const { wrapper, getAttribute } = createWrapper();

        const { result } = renderHook(() => useCatalogItemLoad({ objectDefinition: listItem }), { wrapper });

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(getAttribute).toHaveBeenCalledTimes(1);
        expect(result.current.item).toMatchObject({ labels: [label] });
    });

    it("does not refetch an attribute that already carries its labels", async () => {
        const { wrapper, getAttribute } = createWrapper();

        const { result } = renderHook(
            () => useCatalogItemLoad({ objectDefinition: { ...listItem, labels: [label] } }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(getAttribute).not.toHaveBeenCalled();
    });
});

const insightEntity: IInsight = {
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: "insight.id",
        uri: "/insight.id",
        ref: idRef("insight.id", "insight"),
        permissions: ["SHARE", "VIEW"],
    },
};

const insightListItem: ICatalogItemInsight = {
    identifier: "insight.id",
    type: "insight",
    title: "Revenue by region",
    description: "",
    tags: [],
    visualizationType: "bar",
    createdBy: "",
    createdAt: null,
    updatedBy: "",
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

function createInsightWrapper(enableVisualizationPermissions: boolean) {
    const getInsight = vi.fn().mockResolvedValue(insightEntity);
    const backend = {
        workspace: () => ({ insights: () => ({ getInsight }) }),
    } as unknown as IAnalyticalBackend;
    const permissionsState = {
        status: "success",
        result: { settings: { enableVisualizationPermissions } },
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
    return { wrapper, getInsight };
}

describe("useCatalogItemLoad – visualization permissions", () => {
    it("refetches an insight handed over without permissions once the flag is on", async () => {
        const { wrapper, getInsight } = createInsightWrapper(true);

        const { result } = renderHook(() => useCatalogItemLoad({ objectDefinition: insightListItem }), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(getInsight).toHaveBeenCalledWith(idRef("insight.id", "insight"), {
            loadUserData: true,
            loadPermissions: true,
        });
        expect(result.current.item).toMatchObject({ permissions: ["SHARE", "VIEW"] });
    });

    it("does not refetch an insight while the flag is off", async () => {
        const { wrapper, getInsight } = createInsightWrapper(false);

        const { result } = renderHook(() => useCatalogItemLoad({ objectDefinition: insightListItem }), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(getInsight).not.toHaveBeenCalled();
    });
});

function createDocumentWrapper(
    items: unknown[],
    access: { user?: IUser; permissions?: Partial<IWorkspacePermissions> | Error } = {},
) {
    const documentsQuery = {
        withPage: vi.fn(() => documentsQuery),
        withSize: vi.fn(() => documentsQuery),
        withSorting: vi.fn(() => documentsQuery),
        withOrigin: vi.fn(() => documentsQuery),
        withFilter: vi.fn(() => documentsQuery),
        withMethod: vi.fn(() => documentsQuery),
        query: vi.fn().mockResolvedValue({ items, offset: 0, limit: 1, totalCount: items.length }),
    };
    const { user = { login: "me" } as IUser, permissions = { canCreateDocument: true } } = access;
    const backend = {
        currentUser: () => ({ getUser: () => Promise.resolve(user) }),
        workspace: () => ({
            publisherV2: () => ({ getDocumentsQuery: () => documentsQuery }),
            permissions: () => ({
                getPermissionsForCurrentUser: () =>
                    permissions instanceof Error ? Promise.reject(permissions) : Promise.resolve(permissions),
            }),
        }),
    } as unknown as IAnalyticalBackend;
    // the catalog's own permissions are still loading; the document lookup does not wait for them
    const permissionsState = { status: "loading" } as PermissionsState;

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
    return { wrapper, documentsQuery };
}

describe("useCatalogItemLoad – document", () => {
    it("loads a document by its id as a read-only item", async () => {
        const { wrapper, documentsQuery } = createDocumentWrapper([
            { ref: idRef("doc.id", "document"), title: "Monthly report", version: "2" },
        ]);

        const { result } = renderHook(
            () => useCatalogItemLoad({ objectId: "doc.id", objectType: "document" }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("success");
        });
        expect(documentsQuery.withOrigin).toHaveBeenCalledWith("ALL");
        expect(documentsQuery.withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ id: ["doc.id"], createdBy: undefined }),
        );
        expect(documentsQuery.withMethod).toHaveBeenCalledWith("POST");
        expect(result.current.item).toMatchObject({
            identifier: "doc.id",
            type: "document",
            title: "Monthly report",
            isEditable: false,
        });
    });

    it("looks only among their own native documents for a user without the create grant", async () => {
        const { wrapper, documentsQuery } = createDocumentWrapper([], {
            permissions: { canCreateDocument: false },
        });

        const { result } = renderHook(
            () => useCatalogItemLoad({ objectId: "doc.id", objectType: "document" }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("error");
        });
        expect(documentsQuery.withOrigin).toHaveBeenCalledWith("NATIVE");
        expect(documentsQuery.withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ id: ["doc.id"], createdBy: ["me"] }),
        );
        expect(isNotFound(result.current.error)).toBe(true);
    });

    it("reports the permissions error instead of looking a document up", async () => {
        const permissionsError = new Error("permissions failed");
        const { wrapper, documentsQuery } = createDocumentWrapper([], { permissions: permissionsError });

        const { result } = renderHook(
            () => useCatalogItemLoad({ objectId: "doc.id", objectType: "document" }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current).toMatchObject({ status: "error", error: permissionsError });
        });
        expect(documentsQuery.query).not.toHaveBeenCalled();
    });

    it("reports a document that is not found", async () => {
        const { wrapper } = createDocumentWrapper([]);

        const { result } = renderHook(
            () => useCatalogItemLoad({ objectId: "missing", objectType: "document" }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.status).toBe("error");
        });
        expect(isNotFound(result.current.error)).toBe(true);
    });
});
