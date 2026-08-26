// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../testUtils/recordings.fixture.js";
import { SingleColumn } from "../../tests/table.test.helpers.js";
import { TableDescriptor } from "../tableDescriptor.js";

import { ColumnHeader } from "./ColumnHeader.js";

const fixture = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .SingleMeasureWithTwoRowAndOneColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);
const tableDescriptor = TableDescriptor.for(fixture, "empty value");

const getColumnHeader = (
    props = {},
    { type = "MEASURE_COLUMN", colGroupId = "c_0" } = {},
    table = tableDescriptor,
) => {
    const extendedProps: any = {
        getTableDescriptor: () => table,
        api: {
            refreshHeader: vi.fn(),
            setFocusedHeader: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        },
        column: {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            getSort: vi.fn(),
            getColDef: vi.fn(() => ({
                type,
                colId: colGroupId,
                groupId: colGroupId,
                field: colGroupId,
            })),
        },
        columnGroup: {
            getColGroupDef: vi.fn(() => ({ displayName: "colGroupDisplayName" })),
            getParent: vi.fn(() => ({})),
        },
        gridOptionsWrapper: {},
        enableMenu: true,
        enableSorting: true,
        displayName: "test",
        reactContainer: null,
        showColumnMenu: vi.fn(),
        setSort: vi.fn(),
        menu: vi.fn(),
        ...props,
    };

    return <ColumnHeader {...extendedProps} />;
};

/**
 * The header cell is asserted through its rendered output instead of through a mock of HeaderCell:
 * mocking a sibling module is unreliable here, because the test suite runs without isolation and the
 * module graph is shared between test files.
 */
const headerCellSelector = ".s-pivot-table-column-header";
const labelSelector = ".s-header-cell-label";
const clickableLabelClass = "gd-pivot-table-header-label--clickable";
const rightAlignedLabelClass = "gd-pivot-table-header-label--right";
const centerAlignedLabelClass = "gd-pivot-table-header-label--center";

describe("ColumnHeader renderer", () => {
    it("should render HeaderCell", () => {
        const { container } = render(getColumnHeader());

        expect(container.querySelector(headerCellSelector)).toBeInTheDocument();
        expect(container.querySelector(labelSelector)).toHaveTextContent("test");
    });

    it("should pass enableSorting to HeaderCell", () => {
        const { container } = render(getColumnHeader({ enableSorting: true }));

        expect(container.querySelector(labelSelector)).toHaveClass(clickableLabelClass);
    });

    it("should disable sorting if ColumnHeader is displaying a column attribute (use cse of no measures)", () => {
        const { container } = render(
            getColumnHeader(
                { enableSorting: true },
                { type: "COLUMN_ATTRIBUTE_COLUMN", colGroupId: "cg_0" },
                TableDescriptor.for(SingleColumn, "empty value"),
            ),
        );

        const label = container.querySelector(labelSelector);
        expect(label).toBeInTheDocument();
        expect(label).not.toHaveClass(clickableLabelClass);
    });

    it("should alignment left if this is an attribute", () => {
        const { container } = render(getColumnHeader({}, { colGroupId: "r_0" }));

        const label = container.querySelector(labelSelector);
        expect(label).toBeInTheDocument();
        expect(label).not.toHaveClass(rightAlignedLabelClass);
        expect(label).not.toHaveClass(centerAlignedLabelClass);
    });

    it("should alignment right if this is a measure", () => {
        const { container } = render(getColumnHeader({}, { colGroupId: "c_0" }));

        expect(container.querySelector(labelSelector)).toHaveClass(rightAlignedLabelClass);
    });
});
