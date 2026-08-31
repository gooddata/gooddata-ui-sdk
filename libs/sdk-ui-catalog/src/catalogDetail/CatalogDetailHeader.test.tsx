// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createRef } from "react";

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IDataSetMetadataObject, idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem, ICatalogItemBase } from "../catalogItem/types.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../permission/TestPermissionsProvider.js";

import { CatalogDetailHeader, type ICatalogDetailHeaderRef } from "./CatalogDetailHeader.js";

const backend = dummyBackend();
const noop = vi.fn();

const baseItem = {
    identifier: "item.id",
    title: "My Item",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
} satisfies Omit<ICatalogItemBase, "type">;

const dataSet: IDataSetMetadataObject = {
    type: "dataSet",
    id: "dataset.id",
    uri: "/gdc/md/workspaceId/obj/1",
    ref: idRef("dataset.id", "dataSet"),
    title: "Orders",
    description: "Orders dataset",
    tags: [],
    production: false,
    deprecated: false,
    unlisted: false,
};

const supportedItems: ICatalogItem[] = [
    { ...baseItem, type: "insight", visualizationType: "table" },
    { ...baseItem, type: "analyticalDashboard" },
    { ...baseItem, type: "measure" },
    { ...baseItem, type: "fact" },
    { ...baseItem, type: "attribute" },
];

const unsupportedItems: ICatalogItem[] = [
    { ...baseItem, type: "parameter", definition: { type: "NUMBER", defaultValue: 0 } },
    { ...baseItem, type: "computedAttribute" },
    { ...baseItem, type: "dataSet", dataSet },
];

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="test-workspace">
                    <ToastsCenterContextProvider>
                        <TestPermissionsProvider>{children}</TestPermissionsProvider>
                    </ToastsCenterContextProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

function renderHeader(item: ICatalogItem) {
    const headerRef = createRef<ICatalogDetailHeaderRef>();
    render(
        <CatalogDetailHeader
            item={item}
            canEdit
            actions={null}
            updateItemTitle={noop}
            updateItemDescription={noop}
            isDescriptionGenerationEnabled
            headerRef={headerRef}
        />,
        { wrapper: Wrapper },
    );
    return headerRef;
}

describe("CatalogDetailHeader", () => {
    it.each(supportedItems)("shows the AI generate actions for $type", (item) => {
        const headerRef = renderHeader(item);

        act(() => headerRef.current?.focusTitle());
        expect(screen.getByTestId("analytics-catalog-generate-title-button")).toBeInTheDocument();

        act(() => headerRef.current?.focusDescription());
        expect(screen.getByTestId("analytics-catalog-generate-description-button")).toBeInTheDocument();
    });

    it.each(unsupportedItems)("hides the AI generate actions for $type", (item) => {
        const headerRef = renderHeader(item);

        act(() => headerRef.current?.focusTitle());
        expect(screen.queryByTestId("analytics-catalog-generate-title-button")).not.toBeInTheDocument();

        act(() => headerRef.current?.focusDescription());
        expect(screen.queryByTestId("analytics-catalog-generate-description-button")).not.toBeInTheDocument();
    });
});
