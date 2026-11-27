// (C) 2026 GoodData Corporation

import { type FC } from "react";

import { render } from "@testing-library/react";
import { createPortal } from "react-dom";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type DataViewFacade } from "@gooddata/sdk-ui";

import { DrillableCellHintProvider } from "../../components/Cell/DrillableCellHint.js";
import { type AgGridCellRendererParams, type AgGridColumnDef } from "../../types/agGrid.js";
import { type CellTypes } from "../../types/cellRendering.js";

import { applyCellRenderingToColDef } from "./applyCellRenderingToColDef.js";

const getCellTypesMock = vi.hoisted(() => vi.fn());

vi.mock("../styling/cell.js", () => ({
    getCellTypes: getCellTypesMock,
    getCellClassName: () => "",
    getTransposedCellClassName: () => "",
}));

const DRILL_HINT = "Drillable, press Enter to drill";

function renderCell(isDrillable: boolean) {
    getCellTypesMock.mockReturnValue({ isDrillable } as CellTypes);

    const colDef = applyCellRenderingToColDef(
        { current: [] },
        {} as DataViewFacade,
    )({
        colId: "amount",
        context: {
            columnDefinition: {} as AgGridColumnDef["context"]["columnDefinition"],
            cellRendererFactory: (params) => <span>{params.value}</span>,
        },
    });
    const CellRenderer = colDef.cellRenderer as FC<AgGridCellRendererParams>;

    // ag-grid owns the grid cell element and renders the cell renderer into it through a portal
    const eGridCell = document.createElement("div");
    eGridCell.setAttribute("role", "gridcell");
    document.body.appendChild(eGridCell);

    const result = render(
        <IntlProvider
            locale="en-US"
            messages={{ "visualizations.table.cell.aria.drillableHint": DRILL_HINT }}
        >
            <DrillableCellHintProvider>
                {createPortal(
                    <CellRenderer
                        {...({ value: "$1,458.56", eGridCell } as unknown as AgGridCellRendererParams)}
                    />,
                    eGridCell,
                )}
            </DrillableCellHintProvider>
        </IntlProvider>,
    );

    return { ...result, eGridCell };
}

describe("applyCellRenderingToColDef", () => {
    beforeEach(() => {
        getCellTypesMock.mockReset();
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("describes a drillable cell with the drill hint without changing its content", () => {
        const { getByRole } = renderCell(true);

        const cell = getByRole("gridcell");
        expect(cell).toHaveAccessibleDescription(DRILL_HINT);
        expect(cell).toHaveTextContent(/^\$1,458\.56$/);
    });

    it("does not describe a non-drillable cell with the drill hint", () => {
        const { getByRole } = renderCell(false);

        const cell = getByRole("gridcell");
        expect(cell).not.toHaveAttribute("aria-describedby");
        expect(cell).toHaveAccessibleDescription("");
        expect(cell).toHaveTextContent(/^\$1,458\.56$/);
    });

    it("removes the drill hint when the cell renderer is unmounted", () => {
        const { unmount, eGridCell } = renderCell(true);

        unmount();

        expect(eGridCell).not.toHaveAttribute("aria-describedby");
    });
});
