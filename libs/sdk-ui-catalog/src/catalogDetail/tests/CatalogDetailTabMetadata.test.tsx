// (C) 2025-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

    it("keeps parameters read-only and without visibility controls", () => {
        render(
            <TestIntlProvider>
                <CatalogDetailTabMetadata
                    item={{ ...baseItem, type: "parameter", isEditable: false }}
                    canEdit={false}
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
    });
});
