// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type AttributeDisplayFormType } from "@gooddata/sdk-model";

import {
    createAttributeColumnDefinition,
    createGrandTotalHeaderValue,
} from "../../testing/columnDefinitions.test.helpers.js";
import { useTotalLabelContextMock } from "../../testing/contextMocks.test.helpers.js";
import { type AgGridRowData } from "../../types/internal.js";

import { type AttributeCell as AttributeCellType } from "./AttributeCell.js";

vi.mock("../../context/TotalLabelContext.js", () => ({
    useTotalLabelContext: useTotalLabelContextMock,
}));

let AttributeCell: typeof AttributeCellType;

beforeEach(async () => {
    vi.resetModules();
    ({ AttributeCell } = await import("./AttributeCell.js"));
});

function buildParams(overrides: Partial<Parameters<typeof AttributeCellType>[0]> = {}) {
    const columnDefinition = createAttributeColumnDefinition("country", 0);
    const data: AgGridRowData = {
        allRowData: [],
        cellDataByColId: {
            country: createGrandTotalHeaderValue({
                attributeIdentifier: "country",
                totalType: "sum",
                columnDefinition,
            }),
        },
    };

    return {
        value: "Sum",
        colId: "country",
        columnDefinition,
        intl: {} as unknown as Parameters<typeof AttributeCellType>[0]["intl"],
        data,
        node: { rowIndex: 0 },
        api: { getDisplayedRowAtIndex: () => null },
        ...overrides,
    } as unknown as Parameters<typeof AttributeCellType>[0];
}

function renderInGridCell(params: Parameters<typeof AttributeCellType>[0]) {
    return render(
        <IntlProvider locale="en-US" messages={{}}>
            <div role="gridcell">
                <AttributeCell {...params} />
            </div>
        </IntlProvider>,
    );
}

describe("AttributeCell", () => {
    it("sets aria-haspopup=menu on the ancestor grid cell for a renameable, visible total-label cell", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: true });

        const { container } = renderInGridCell(buildParams());

        expect(container.querySelector("[role='gridcell']")).toHaveAttribute("aria-haspopup", "menu");
    });

    it("does not set aria-haspopup when total-label editing is disabled", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: false });

        const { container } = renderInGridCell(buildParams());

        expect(container.querySelector("[role='gridcell']")).not.toHaveAttribute("aria-haspopup");
    });

    it("does not set aria-haspopup on an ordinary (non-total) attribute cell", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: true });

        const { container } = renderInGridCell(
            buildParams({ value: "Germany", data: { allRowData: [], cellDataByColId: {} } as AgGridRowData }),
        );

        expect(container.querySelector("[role='gridcell']")).not.toHaveAttribute("aria-haspopup");
    });

    it("does not set aria-haspopup on a blank duplicate total-label cell in a multi-attribute-column row", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: true });

        const cityColumnDefinition = createAttributeColumnDefinition("city", 1);
        const data: AgGridRowData = {
            allRowData: [],
            cellDataByColId: {
                country: createGrandTotalHeaderValue({
                    attributeIdentifier: "country",
                    totalType: "sum",
                    columnDefinition: createAttributeColumnDefinition("country", 0),
                }),
                city: createGrandTotalHeaderValue({
                    attributeIdentifier: "country",
                    totalType: "sum",
                    columnDefinition: cityColumnDefinition,
                }),
            },
        };

        const { container } = renderInGridCell(
            buildParams({ value: "Sum", colId: "city", columnDefinition: cityColumnDefinition, data }),
        );

        expect(container.querySelector("[role='gridcell']")).not.toHaveAttribute("aria-haspopup");
    });

    it("sets aria-haspopup=menu on a renameable total cell rendered through the image branch (image-typed attribute)", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: true });

        const baseColumnDefinition = createAttributeColumnDefinition("country", 0);
        const imageColumnDefinition = {
            ...baseColumnDefinition,
            attributeDescriptor: {
                ...baseColumnDefinition.attributeDescriptor,
                attributeHeader: {
                    ...baseColumnDefinition.attributeDescriptor.attributeHeader,
                    labelType: "GDC.image" as AttributeDisplayFormType,
                },
            },
        };
        const data: AgGridRowData = {
            allRowData: [],
            cellDataByColId: {
                country: createGrandTotalHeaderValue({
                    attributeIdentifier: "country",
                    totalType: "sum",
                    columnDefinition: imageColumnDefinition,
                }),
            },
        };

        const { container } = renderInGridCell(
            buildParams({ value: "Sum", columnDefinition: imageColumnDefinition, data }),
        );

        expect(container.querySelector("[role='gridcell']")).toHaveAttribute("aria-haspopup", "menu");
    });

    it("clears aria-haspopup on unmount", () => {
        useTotalLabelContextMock.mockReturnValue({ enabled: true });

        const { container, unmount } = renderInGridCell(buildParams());
        const gridCell = container.querySelector("[role='gridcell']");

        expect(gridCell).toHaveAttribute("aria-haspopup", "menu");

        unmount();

        expect(gridCell).not.toHaveAttribute("aria-haspopup");
    });
});
