// (C) 2025-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IDataSetMetadataObject, idRef } from "@gooddata/sdk-model";

import type { ICatalogItem } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { CatalogDetailTabMetadata } from "../CatalogDetailTabMetadata.js";

const baseItem: ICatalogItem = {
    type: "measure",
    identifier: "metric.id",
    title: "Revenue",
    description: "Description",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    isLocked: false,
    isEditable: true,
};

const noop = vi.fn();
const dataSetMetadata: IDataSetMetadataObject = {
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
    attributes: [
        {
            type: "attribute",
            id: "attr.id",
            uri: "/gdc/md/workspaceId/obj/2",
            ref: idRef("attr.id", "attribute"),
            title: "Order date",
            description: "Order date",
            tags: [],
            production: false,
            deprecated: false,
            unlisted: false,
        },
    ],
};

function renderComponent(enableMetricFormatOverrides = false) {
    return render(
        <TestIntlProvider>
            <CatalogDetailTabMetadata
                item={baseItem}
                canEdit
                onTagClick={noop}
                onTagAdd={noop}
                onTagRemove={noop}
                onIsHiddenChange={noop}
                onIsHiddenFromKdaChange={noop}
                onMetricTypeChange={noop}
                onFormatChange={noop}
                enableMetricFormatOverrides={enableMetricFormatOverrides}
            />
        </TestIntlProvider>,
    );
}

describe("CatalogDetailTabMetadata", () => {
    it("hides metric settings when metric format overrides feature is disabled", () => {
        renderComponent(false);

        expect(screen.queryByText("Metric type")).not.toBeInTheDocument();
        expect(screen.queryByText("Number format")).not.toBeInTheDocument();
    });

    it("shows metric settings when metric format overrides feature is enabled", () => {
        renderComponent(true);

        expect(screen.getByText("Metric type")).toBeInTheDocument();
        expect(screen.getByText("Number format")).toBeInTheDocument();
    });

    it("keeps parameters limited to supported metadata controls", () => {
        render(
            <TestIntlProvider>
                <CatalogDetailTabMetadata
                    item={{
                        ...baseItem,
                        type: "parameter",
                        isEditable: true,
                        definition: { type: "NUMBER", defaultValue: 0 },
                    }}
                    canEdit
                    onTagClick={noop}
                    onTagAdd={noop}
                    onTagRemove={noop}
                    onIsHiddenChange={noop}
                    onIsHiddenFromKdaChange={noop}
                    onMetricTypeChange={noop}
                    onFormatChange={noop}
                    enableMetricFormatOverrides
                />
            </TestIntlProvider>,
        );

        expect(screen.queryByText("Show in AI results")).not.toBeInTheDocument();
        expect(screen.queryByText("Use for key driver analysis")).not.toBeInTheDocument();
        expect(screen.queryByText("Metric type")).not.toBeInTheDocument();
        expect(screen.getByText("Tags")).toBeInTheDocument();
    });

    it("keeps datasets limited to supported metadata controls", () => {
        render(
            <TestIntlProvider>
                <CatalogDetailTabMetadata
                    item={{ ...baseItem, type: "dataSet", dataSet: dataSetMetadata }}
                    canEdit
                    onTagClick={noop}
                    onTagAdd={noop}
                    onTagRemove={noop}
                    onIsHiddenChange={noop}
                    onIsHiddenFromKdaChange={noop}
                    onMetricTypeChange={noop}
                    onFormatChange={noop}
                    enableMetricFormatOverrides
                />
            </TestIntlProvider>,
        );

        expect(screen.queryByText("Show in AI results")).not.toBeInTheDocument();
        expect(screen.queryByText("Use for key driver analysis")).not.toBeInTheDocument();
        expect(screen.getByText("Granularities")).toBeInTheDocument();
    });
});
