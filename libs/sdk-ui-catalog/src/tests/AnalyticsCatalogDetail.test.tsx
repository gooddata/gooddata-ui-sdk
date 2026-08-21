// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IUser, IWorkspacePermissions } from "@gooddata/sdk-model";

import { AnalyticsCatalogDetail, AnalyticsCatalogDetailContent } from "../AnalyticsCatalogDetail.js";
import type { ICatalogItemMeasure, ICatalogItemParameter } from "../catalogItem/types.js";

vi.mock("../permission/usePermissionsQuery.js", () => ({
    usePermissionsQuery: () => ({
        status: "success",
        result: {
            permissions: { canManageProject: true } as IWorkspacePermissions,
            user: { login: "test" } as IUser,
            settings: {
                enableAnalyticalCatalogMetricEditor: true,
                enableParameters: true,
            } as IUserWorkspaceSettings,
        },
    }),
}));

vi.mock("../asCode/AsCodeEditorBody.js", () => import("../asCode/tests/asCodeEditorBody.test.utils.js"));

/**
 * Clicks Edit and leaves the as-code dialog fully rendered, editor body and all.
 *
 * Two things make the naive `fireEvent.click` + `await screen.findByTestId("yaml-editor")` cost
 * ~300ms on the first click of a run, both worked around here:
 *
 * 1. The dialog `lazy()`-loads its editor body, and the payload only starts loading when React
 *    first renders it — mid-click, where it can only resolve on a later tick. Importing the module
 *    up front (the same specifier, so the same mock) makes that payload resolve immediately.
 * 2. That first render commits a Suspense fallback, and React then withholds the resolved content
 *    for `FALLBACK_THROTTLE_MS` (300ms) so the fallback can't flash — except inside `act`, which
 *    commits straight away. `findBy*` deliberately runs outside `act`, so it pays the throttle in
 *    full; driving the click through `act` settles the same DOM in a couple of milliseconds.
 */
async function openAsCodeDialog(editBtn: HTMLElement) {
    await import("../asCode/AsCodeEditorBody.js");
    await act(async () => {
        fireEvent.click(editBtn);
    });
}

const backend = dummyBackend();

const parameterItem: ICatalogItemParameter = {
    identifier: "param.id",
    type: "parameter",
    title: "My Param",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 0 },
};

const measureItem: ICatalogItemMeasure = {
    identifier: "measure.id",
    type: "measure",
    title: "My Metric",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

describe("AnalyticsCatalogDetailContent smoke", () => {
    it("provides required context so clicking Edit on a parameter opens the dialog without crashing", async () => {
        render(
            <AnalyticsCatalogDetailContent
                backend={backend}
                workspace="test-ws"
                objectId={parameterItem.identifier}
                objectType={parameterItem.type}
                objectDefinition={parameterItem}
            />,
        );

        const editBtn = await screen.findByRole("button", { name: /^edit$/i });
        await openAsCodeDialog(editBtn);

        expect(screen.getByTestId("yaml-editor")).toBeInTheDocument();
    });

    it("provides the metric mutation context so a metric detail renders its action bar without crashing", async () => {
        render(
            <AnalyticsCatalogDetailContent
                backend={backend}
                workspace="test-ws"
                objectId={measureItem.identifier}
                objectType={measureItem.type}
                objectDefinition={measureItem}
            />,
        );

        expect(await screen.findByRole("button", { name: /^edit$/i })).toBeInTheDocument();
    });
});

describe("AnalyticsCatalogDetail smoke", () => {
    it("provides required context in the drawer variant so clicking Edit on a parameter opens the dialog", async () => {
        render(
            <AnalyticsCatalogDetail
                backend={backend}
                workspace="test-ws"
                open
                onClose={vi.fn()}
                objectId={parameterItem.identifier}
                objectType={parameterItem.type}
                objectDefinition={parameterItem}
            />,
        );

        const editBtn = await screen.findByRole("button", { name: /^edit$/i });
        await openAsCodeDialog(editBtn);

        expect(screen.getByTestId("yaml-editor")).toBeInTheDocument();
    });
});
