// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createElement } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { createLabel } from "../../catalogItem/testFixtures.js";
import type { ICatalogItemAttribute } from "../../catalogItem/types.js";
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
