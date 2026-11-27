// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    createGrandTotalColumnDefinition,
    createSubtotalColumnDefinition,
    createValueColumnDefinition,
} from "../../testing/columnDefinitions.test.helpers.js";
import {
    mockUseAgGridApi,
    mockUseHeaderMenu,
    useCurrentDataViewMock,
    usePivotTablePropsMock,
    useTotalLabelContextMock,
} from "../../testing/contextMocks.test.helpers.js";
import { type AgGridColumnGroupDef, type AgGridHeaderGroupParams } from "../../types/agGrid.js";

import { type PivotGroupHeader as PivotGroupHeaderType } from "./PivotGroupHeader.js";

function renderWithIntl(ui: ReactElement) {
    return render(
        <IntlProvider locale="en-US" messages={{}}>
            {ui}
        </IntlProvider>,
    );
}

vi.mock("../../context/TotalLabelContext.js", () => ({
    useTotalLabelContext: useTotalLabelContextMock,
}));

vi.mock("../../context/PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("../../context/CurrentDataViewContext.js", () => ({
    useCurrentDataView: useCurrentDataViewMock,
}));

vi.mock("../../context/AgGridApiContext.js", () => ({
    useAgGridApi: mockUseAgGridApi,
}));

// The menu (aggregations/text-wrapping/sorting) is orthogonal to what's under test here — its own
// sub-hooks pull in several more contexts (ColumnDefsContext, AgGridApiContext) that have nothing to
// do with total-label-target resolution, so it's mocked wholesale rather than chased down.
vi.mock("../../hooks/header/useHeaderMenu.js", () => ({
    useHeaderMenu: mockUseHeaderMenu,
}));

// Several other test files (real usages and other mocks) also touch these same context/hook paths,
// and the suite runs with isolate: false (see vitest.config.ts's own comment on this exact pattern) -
// without resetting modules and re-importing dynamically, whichever file's resolution happens to be
// cached first "wins" for the whole worker, so this file's own vi.mock calls above can silently not apply.
let PivotGroupHeader: typeof PivotGroupHeaderType;

// Grand total spanning two column attributes — the exact shape that produces nested "Sum" > "Sum"
// group levels via shouldSkipHeaderName (columnDefsToPivotGroups.ts), matching the fixture style in
// totalLabelTarget.test.ts.
const GRAND_TOTAL_COLUMN_DEFINITION = createGrandTotalColumnDefinition(
    ["outer-attribute", "inner-attribute"],
    "SUM",
);

// Year > Quarter pivot with a subtotal on Quarter. The "2023" group's own context.columnDefinition
// comes from whichever child leaf columnDefsToPivotGroups.ts happens to construct it from first — a
// regular Quarter VALUE column, not the subtotal — so this fixture is deliberately NOT itself a
// total/subtotal column definition.
const YEAR_QUARTER_VALUE_COLUMN_DEFINITION = createValueColumnDefinition({
    attributeIdentifier: "quarter",
    measureIdentifier: "revenue",
    attributeElementUri: "/gdc/md/demo/obj/quarter",
});

// The Quarter subtotal itself, living as a DIRECT CHILD of the "2023" group (a sibling of the
// regular quarter value columns) — the shape that made isSubtotalGroup (and, before the recursion
// was removed, resolveTotalLabelTargetFromColDef) see a match on the wrong, non-total ancestor.
const QUARTER_SUBTOTAL_COLUMN_DEFINITION = createSubtotalColumnDefinition(["year"], "quarter", "SUM");

type PivotGroupHeaderParams = AgGridHeaderGroupParams & {
    measureIdentifiers: string[];
    pivotGroupDepth?: number;
};

function buildParams(colGroupDef: AgGridColumnGroupDef, displayName: string): PivotGroupHeaderParams {
    const eGridHeader = document.createElement("div");
    return {
        columnGroup: {
            getColGroupDef: () => colGroupDef,
        },
        displayName,
        eGridHeader,
        measureIdentifiers: [],
        pivotGroupDepth: 1,
    } as unknown as PivotGroupHeaderParams;
}

function getHeaderRoot(): HTMLElement {
    const root = document.querySelector('[data-testid~="pivot-header"]');
    if (!root) {
        throw new Error("pivot header root not found");
    }
    return root as HTMLElement;
}

describe("PivotGroupHeader — total label target for blanked nested groups", () => {
    // Reset once for this file's mocks. Cold imports can exceed the default hook timeout on CI;
    // individual tests only need their mock values reset, not the whole dependency graph reloaded.
    beforeAll(async () => {
        vi.resetModules();
        ({ PivotGroupHeader } = await import("./PivotGroupHeader.js"));
    }, 30_000);

    beforeEach(() => {
        usePivotTablePropsMock.mockReturnValue({
            config: {
                menu: {
                    aggregations: false,
                    aggregationsSubMenu: false,
                    aggregationsSubMenuForRows: false,
                    aggregationTypes: [],
                    totalLabelsEditable: true,
                },
                columnHeadersPosition: "top",
                measureGroupDimension: "columns",
            },
            execution: { definition: { buckets: [], filters: [] } },
            rows: [],
            columns: [],
            drillableItems: undefined,
            onDrill: undefined,
            pushData: vi.fn(),
        });
        useCurrentDataViewMock.mockReturnValue({ currentDataView: undefined });
    });

    it("renders blank and is not clickable for a nested group whose headerName was blanked (repeated total label), even though a custom label exists for its resolved target", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        // Same context.columnDefinition as the visible outer "Sum" group — mirrors how
        // columnDefsToPivotGroups.ts unconditionally assigns it regardless of header blanking.
        const blankedNestedGroup: AgGridColumnGroupDef = {
            groupId: "total>total",
            headerName: undefined,
            children: [],
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        renderWithIntl(<PivotGroupHeader {...buildParams(blankedNestedGroup, "")} />);

        // Not just empty text - the test-id itself must be absent, or this row still counts as a
        // second match for any locator/query keyed on it (e.g. the e2e "one header shows the total's
        // label" check), alongside whichever row actually owns the label.
        expect(screen.queryByTestId("pivot-header-text")).not.toBeInTheDocument();

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).not.toHaveBeenCalled();
    });

    it('renders blank even when AG Grid\'s own resolved displayName for the blanked group is non-empty (e.g. still "Sum"), instead of falling back to it', () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const blankedNestedGroup: AgGridColumnGroupDef = {
            groupId: "total>total",
            headerName: undefined,
            children: [],
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        renderWithIntl(<PivotGroupHeader {...buildParams(blankedNestedGroup, "Sum")} />);

        expect(screen.queryByTestId("pivot-header-text")).not.toBeInTheDocument();
    });

    it("still opens the rename menu and shows the custom label for the visible ancestor group of the same total", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const visibleOuterGroup: AgGridColumnGroupDef = {
            groupId: "total",
            headerName: "Sum",
            children: [],
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        renderWithIntl(<PivotGroupHeader {...buildParams(visibleOuterGroup, "Sum")} />);

        expect(screen.getByTestId("pivot-header-text")).toHaveTextContent("Custom label");

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).toHaveBeenCalledTimes(1);
    });

    it("renders blank and is not clickable for a visible total group when the table is transposed - MeasureHeader's own leaf cell owns the label there instead", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });
        usePivotTablePropsMock.mockReturnValue({
            config: {
                menu: {
                    aggregations: false,
                    aggregationsSubMenu: false,
                    aggregationsSubMenuForRows: false,
                    aggregationTypes: [],
                    totalLabelsEditable: true,
                },
                columnHeadersPosition: "top",
                measureGroupDimension: "rows",
            },
            execution: { definition: { buckets: [], filters: [] } },
            rows: [],
            columns: [],
            drillableItems: undefined,
            onDrill: undefined,
            pushData: vi.fn(),
        });

        const visibleOuterGroup: AgGridColumnGroupDef = {
            groupId: "total",
            headerName: "Sum",
            children: [],
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        renderWithIntl(<PivotGroupHeader {...buildParams(visibleOuterGroup, "Sum")} />);

        // Not just empty text - the test-id itself must be absent, or this row still counts as a
        // second match for any locator/query keyed on it, alongside MeasureHeader's own leaf cell
        // which owns the label in transposed mode.
        expect(screen.queryByTestId("pivot-header-text")).not.toBeInTheDocument();

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).not.toHaveBeenCalled();
    });

    it("opens the rename menu on Enter (keyboard is routed through useHeaderSpaceKey, not a separate listener)", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) => (target ? "Custom label" : undefined));
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const visibleOuterGroup: AgGridColumnGroupDef = {
            groupId: "total",
            headerName: "Sum",
            children: [],
            context: { columnDefinition: GRAND_TOTAL_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        const params = buildParams(visibleOuterGroup, "Sum");
        renderWithIntl(<PivotGroupHeader {...params} />);

        fireEvent.keyDown(params.eGridHeader, { key: "Enter" });

        expect(openTotalLabelMenu).toHaveBeenCalledTimes(1);
        expect(openTotalLabelMenu).toHaveBeenCalledWith(
            expect.objectContaining({ anchor: params.eGridHeader }),
        );
    });

    // "2023" is shared between a Year=2023 value leaf and the Year=2023 Quarter-subtotal leaf, so its
    // own columnDefinition is "value" — isRegularValueColumn keeps isSubtotalHeader false regardless
    // of what a child is.
    it("does not resolve a rename target for a non-total ancestor group just because one of its direct children is a subtotal (Year > Quarter, subtotal on Quarter)", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn((target: unknown) =>
            target ? "WRONG — Quarter subtotal alias" : undefined,
        );
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const yearGroupWithSubtotalChild: AgGridColumnGroupDef = {
            groupId: "2023",
            headerName: "2023",
            children: [
                {
                    colId: "2023>q1>revenue",
                    context: { columnDefinition: YEAR_QUARTER_VALUE_COLUMN_DEFINITION },
                },
                { colId: "2023>subtotal", context: { columnDefinition: QUARTER_SUBTOTAL_COLUMN_DEFINITION } },
            ],
            context: { columnDefinition: YEAR_QUARTER_VALUE_COLUMN_DEFINITION, indexWithinGroup: 0 },
        };

        renderWithIntl(<PivotGroupHeader {...buildParams(yearGroupWithSubtotalChild, "2023")} />);

        expect(screen.getByTestId("pivot-header-text")).toHaveTextContent("2023");
        expect(screen.getByTestId("pivot-header-text")).not.toHaveTextContent("WRONG");

        fireEvent.click(getHeaderRoot());
        expect(openTotalLabelMenu).not.toHaveBeenCalled();
    });
});
