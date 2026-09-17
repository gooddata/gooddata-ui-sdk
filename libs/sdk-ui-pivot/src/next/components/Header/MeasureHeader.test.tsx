// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGrandTotalColumnDefinition } from "../../testing/columnDefinitions.test.helpers.js";
import {
    mockUseAgGridApi,
    mockUseHeaderMenu,
    usePivotTablePropsMock,
    useTotalLabelContextMock,
} from "../../testing/contextMocks.test.helpers.js";
import { type AgGridColumnDef, type AgGridHeaderParams } from "../../types/agGrid.js";

import { type MeasureHeader as MeasureHeaderType } from "./MeasureHeader.js";

function renderWithIntl(ui: ReactElement) {
    return render(
        <IntlProvider locale="en-US" messages={{}}>
            {ui}
        </IntlProvider>,
    );
}

const { useColumnDefsMock } = vi.hoisted(() => ({
    useColumnDefsMock: vi.fn(),
}));

vi.mock("../../context/TotalLabelContext.js", () => ({
    useTotalLabelContext: useTotalLabelContextMock,
}));

vi.mock("../../context/PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("../../context/ColumnDefsContext.js", () => ({
    useColumnDefs: useColumnDefsMock,
}));

vi.mock("../../context/AgGridApiContext.js", () => ({
    useAgGridApi: mockUseAgGridApi,
}));

// Orthogonal to what's under test here - see the same rationale in PivotGroupHeader.test.tsx.
vi.mock("../../hooks/header/useHeaderMenu.js", () => ({
    useHeaderMenu: mockUseHeaderMenu,
}));

// Several other test files (real usages and other mocks) also touch these same context/hook paths,
// and the suite runs with isolate: false (see vitest.config.ts's own comment on this exact pattern) -
// without resetting modules and re-importing dynamically, whichever file's resolution happens to be
// cached first "wins" for the whole worker, so this file's own vi.mock calls above can silently not apply.
let MeasureHeader: typeof MeasureHeaderType;

const GRAND_TOTAL_COLUMN_DEFINITION = createGrandTotalColumnDefinition(["row-attribute"], "SUM");

function buildParams(colDef: AgGridColumnDef, displayName: string): AgGridHeaderParams {
    const eGridHeader = document.createElement("div");
    // A column other than this header's own column is "first displayed" so isFirstDisplayedColumn is
    // false and HeaderKeyboardHint renders children directly, without pulling in UiTooltip.
    const otherColumn = {};
    return {
        column: { getColDef: () => colDef },
        displayName,
        eGridHeader,
        api: { getAllDisplayedColumns: () => [otherColumn] },
    } as unknown as AgGridHeaderParams;
}

function getHeaderRoot(): HTMLElement {
    const root = document.querySelector('[data-testid~="pivot-header"]');
    if (!root) {
        throw new Error("pivot header root not found");
    }
    return root as HTMLElement;
}

describe("MeasureHeader — total label rename wiring", () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ MeasureHeader } = await import("./MeasureHeader.js"));

        usePivotTablePropsMock.mockReturnValue({
            config: {
                menu: { totalLabelsEditable: true },
                measureGroupDimension: "rows",
                columnHeadersPosition: "top",
            },
            execution: { definition: { buckets: [], filters: [] } },
            rows: [],
            columns: [],
            drillableItems: undefined,
            onDrill: undefined,
            pushData: vi.fn(),
        });
        useColumnDefsMock.mockReturnValue({ isPivoted: false });
    });

    it("does not resolve a rename target when the table is not transposed, even for a total-typed column", () => {
        usePivotTablePropsMock.mockReturnValue({
            config: {
                menu: { totalLabelsEditable: true },
                measureGroupDimension: "columns",
                columnHeadersPosition: "top",
            },
            execution: { definition: { buckets: [], filters: [] } },
            rows: [],
            columns: [],
            drillableItems: undefined,
            onDrill: undefined,
            pushData: vi.fn(),
        });

        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const colDef: AgGridColumnDef = {
            colId: "grand-total",
            sortable: false,
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION },
        };

        renderWithIntl(<MeasureHeader {...buildParams(colDef, "Sum")} />);

        expect(screen.getByTestId("pivot-header-text")).toHaveTextContent("Sum");

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).not.toHaveBeenCalled();
    });

    it("opens the rename menu and shows the custom label on click when the table is transposed", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const colDef: AgGridColumnDef = {
            colId: "grand-total",
            sortable: false,
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION },
        };

        renderWithIntl(<MeasureHeader {...buildParams(colDef, "Sum")} />);

        expect(screen.getByTestId("pivot-header-text")).toHaveTextContent("Custom label");

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).toHaveBeenCalledTimes(1);
    });

    // Regression test for the removal of useTotalLabelMenuKeyboard (see PivotGroupHeader.test.tsx for
    // the full rationale): keyboard opening now goes entirely through useHeaderSpaceKey by passing it
    // the rename handler as its action when a target exists, instead of a second independent listener.
    it("opens the rename menu on Enter when the table is transposed (keyboard is routed through useHeaderSpaceKey, not a separate listener)", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const colDef: AgGridColumnDef = {
            colId: "grand-total",
            sortable: false,
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION },
        };

        const params = buildParams(colDef, "Sum");
        renderWithIntl(<MeasureHeader {...params} />);

        fireEvent.keyDown(params.eGridHeader, { key: "Enter" });

        expect(openTotalLabelMenu).toHaveBeenCalledTimes(1);
        expect(openTotalLabelMenu).toHaveBeenCalledWith(
            expect.objectContaining({ anchor: params.eGridHeader }),
        );
    });
});
