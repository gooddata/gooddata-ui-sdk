// (C) 2025-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IDataSetMetadataObject,
    type IDateRangeParameterPeriod,
    type ISettings,
    idRef,
} from "@gooddata/sdk-model";

import { createLabel } from "../catalogItem/testFixtures.js";
import type { ICatalogItem, ICatalogItemAttribute } from "../catalogItem/types.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { CatalogDetailTabMetadata } from "./CatalogDetailTabMetadata.js";

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
        <TestPermissionsProvider>
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
            </TestIntlProvider>
        </TestPermissionsProvider>,
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
            <TestPermissionsProvider>
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
                </TestIntlProvider>
            </TestPermissionsProvider>,
        );

        expect(screen.queryByText("Show in AI results")).not.toBeInTheDocument();
        expect(screen.queryByText("Use for key driver analysis")).not.toBeInTheDocument();
        expect(screen.queryByText("Metric type")).not.toBeInTheDocument();
        expect(screen.getByText("Tags")).toBeInTheDocument();
    });

    it("keeps datasets limited to supported metadata controls", () => {
        render(
            <TestPermissionsProvider>
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
                </TestIntlProvider>
            </TestPermissionsProvider>,
        );

        expect(screen.queryByText("Show in AI results")).not.toBeInTheDocument();
        expect(screen.queryByText("Use for key driver analysis")).not.toBeInTheDocument();
        expect(screen.getByText("Granularities")).toBeInTheDocument();
    });

    it("names the object's type in the first row", () => {
        renderComponent();

        const terms = screen.getAllByRole("term").map((el) => el.textContent);
        expect(terms[0]).toBe("Type");
        expect(screen.getByText("Metric")).toBeInTheDocument();
    });
});

describe("CatalogDetailTabMetadata — date range parameter", () => {
    function renderPeriod(
        enableDateRangeParameters: boolean,
        from?: string,
        defaultValue: IDateRangeParameterPeriod = { granularity: "GDC.time.month", from, to: "2026-08" },
        settings: ISettings = {},
    ) {
        return render(
            <TestPermissionsProvider
                result={{
                    ...defaultPermissionsResult,
                    settings: {
                        ...defaultPermissionsResult.settings,
                        ...settings,
                        enableDateRangeParameters,
                    },
                }}
            >
                <TestIntlProvider>
                    <CatalogDetailTabMetadata
                        item={{
                            ...baseItem,
                            type: "parameter",
                            definition: {
                                type: "DATE_RANGE",
                                defaultValue,
                            },
                        }}
                        canEdit
                        onTagClick={noop}
                        onTagAdd={noop}
                        onTagRemove={noop}
                        onIsHiddenChange={noop}
                        onIsHiddenFromKdaChange={noop}
                    />
                </TestIntlProvider>
            </TestPermissionsProvider>,
        );
    }

    it("shows the granularity and the current range of the period", () => {
        renderPeriod(true, "2025-08");

        expect(screen.getByText("Granularity")).toBeInTheDocument();
        expect(screen.getByText("Month")).toBeInTheDocument();
        expect(screen.getByText("Current range")).toBeInTheDocument();
        expect(screen.getByText("August 2025 – August 2026")).toBeInTheDocument();
    });

    it("names a period open at the start by its end", () => {
        renderPeriod(true);

        expect(screen.getByText("To August 2026")).toBeInTheDocument();
    });

    it("writes days in the user's date format", () => {
        renderPeriod(
            true,
            undefined,
            { granularity: "GDC.time.date", from: "2025-08-14", to: "2025-08-15" },
            { responsiveUiDateFormat: "dd/MM/yyyy" },
        );

        expect(screen.getByText("14/08/2025 – 15/08/2025")).toBeInTheDocument();
    });

    it("writes days in the pattern of the user's format locale before the date format", () => {
        renderPeriod(
            true,
            undefined,
            { granularity: "GDC.time.date", from: "2025-08-14", to: "2025-08-15" },
            { formatLocale: "de-DE", responsiveUiDateFormat: "dd/MM/yyyy" },
        );

        expect(screen.getByText("14.8.2025 – 15.8.2025")).toBeInTheDocument();
    });

    it("writes weeks as their days from the user's week start", () => {
        renderPeriod(
            true,
            undefined,
            { granularity: "GDC.time.week", from: "2025-33", to: "2025-35" },
            { weekStart: "Monday" },
        );

        expect(screen.getByText("08/11/2025 – 08/31/2025")).toBeInTheDocument();
    });

    it("shows neither row while date range parameters are off", () => {
        renderPeriod(false, "2025-08");

        expect(screen.queryByText("Granularity")).not.toBeInTheDocument();
        expect(screen.queryByText("Current range")).not.toBeInTheDocument();
    });
});

describe("CatalogDetailTabMetadata — label conditional formatting", () => {
    const attributeItem: ICatalogItemAttribute = {
        ...baseItem,
        type: "attribute",
        labels: [createLabel("label.name", "Region Name")],
    };

    function renderAttribute(
        opts: {
            enableSemanticConditionalFormatting?: boolean;
            onLabelConditionalFormattingChange?: () => void;
        } = {},
    ) {
        const { enableSemanticConditionalFormatting = false, ...props } = opts;

        return render(
            <TestPermissionsProvider
                result={{
                    ...defaultPermissionsResult,
                    settings: { ...defaultPermissionsResult.settings, enableSemanticConditionalFormatting },
                }}
            >
                <TestIntlProvider>
                    <CatalogDetailTabMetadata
                        item={attributeItem}
                        canEdit
                        onTagClick={noop}
                        onTagAdd={noop}
                        onTagRemove={noop}
                        onIsHiddenChange={noop}
                        onIsHiddenFromKdaChange={noop}
                        onMetricTypeChange={noop}
                        onFormatChange={noop}
                        {...props}
                    />
                </TestIntlProvider>
            </TestPermissionsProvider>,
        );
    }

    it("shows the conditional formatting row with the labels when the flag is on and a handler is provided", () => {
        renderAttribute({
            enableSemanticConditionalFormatting: true,
            onLabelConditionalFormattingChange: noop,
        });

        expect(screen.getByText("Conditional formatting")).toBeInTheDocument();
        expect(screen.getByText("Region Name")).toBeInTheDocument();
        expect(screen.getByText("Add rule")).toBeInTheDocument();
    });

    it("hides the rows when the flag is off, even with a handler provided", () => {
        renderAttribute({
            enableSemanticConditionalFormatting: false,
            onLabelConditionalFormattingChange: noop,
        });

        expect(screen.queryByText("Add rule")).not.toBeInTheDocument();
    });

    it("hides the rows when no handler is provided, even with the flag on", () => {
        renderAttribute({ enableSemanticConditionalFormatting: true });

        expect(screen.queryByText("Add rule")).not.toBeInTheDocument();
    });
});
