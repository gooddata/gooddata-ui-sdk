// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
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
            settings: { enableAnalyticalCatalogMetricEditor: true } as IUserWorkspaceSettings,
        },
    }),
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        SyntaxHighlightingInput: ({
            value,
            onChange,
        }: {
            value: string;
            onChange: (value: string) => void;
        }) => <textarea data-testid="yaml-editor" value={value} onChange={(e) => onChange(e.target.value)} />,
    };
});

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
        fireEvent.click(editBtn);

        expect(await screen.findByTestId("yaml-editor")).toBeInTheDocument();
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
        fireEvent.click(editBtn);

        expect(await screen.findByTestId("yaml-editor")).toBeInTheDocument();
    });
});
