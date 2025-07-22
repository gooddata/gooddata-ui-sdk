// (C) 2019-2025 GoodData Corporation
import { act, render } from "@testing-library/react";
import { createIntlMock } from "@gooddata/sdk-ui";
import AggregationsMenu, { IAggregationsMenuProps } from "../AggregationsMenu.js";
import AggregationsSubMenu from "../AggregationsSubMenu.js";
import { AVAILABLE_TOTALS } from "../../../base/constants.js";
import {
    defWithFilters,
    emptyDef,
    ITotal,
    newPositiveAttributeFilter,
    idRef,
    localIdRef,
    newMeasureValueFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { TableDescriptor } from "../../tableDescriptor.js";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

console.log("TEST FILE: Loading AggregationsMenu.test.tsx");

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../AggregationsSubMenu", () => {
    console.log("TEST FILE: Setting up AggregationsSubMenu mock");
    return {
        __esModule: true,
        default: vi.fn(() => {
            console.log("MOCK: AggregationsSubMenu render called");
            return null;
        }),
    };
});

console.log("TEST FILE: Creating intlMock");
const intlMock = createIntlMock({
    "visualizations.totals.dropdown.tooltip.nat.disabled.ranking": "Tooltip 1",
    "visualizations.totals.dropdown.tooltip.nat.disabled.mvf": "Tooltip 2",
});
console.log("TEST FILE: intlMock created");

describe("AggregationsMenu", () => {
    console.log("TEST FILE: Inside describe block");

    const attributeColumnId = "c_0";
    console.log("TEST FILE: Creating fixture");
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndTwoColumnAttributes,
        DataViewFirstPage,
    );
    console.log("TEST FILE: Fixture created");

    console.log("TEST FILE: Creating tableDescriptor");
    const tableDescriptor = TableDescriptor.for(fixture, "empty value");
    console.log("TEST FILE: tableDescriptor created");

    const getExecutionDefinition = () => {
        console.log("TEST FILE: getExecutionDefinition called");
        return emptyDef("testWorkspace");
    };
    const getColumnTotals = () => {
        console.log("TEST FILE: getColumnTotals called");
        return [] as ITotal[];
    };
    const getRowTotals = () => {
        console.log("TEST FILE: getRowTotals called");
        return [] as ITotal[];
    };
    const getTableDescriptor = () => {
        console.log("TEST FILE: getTableDescriptor called");
        return tableDescriptor;
    };
    const onMenuOpenedChange = vi.fn();
    const onAggregationSelect = vi.fn();

    function renderComponent(customProps: Partial<IAggregationsMenuProps> = {}) {
        console.log("TEST FILE: renderComponent called with props:", customProps);
        const result = render(
            <AggregationsMenu
                intl={intlMock}
                isMenuOpened={true}
                isMenuButtonVisible={true}
                showSubmenu={false}
                showColumnsSubMenu={false}
                availableTotalTypes={AVAILABLE_TOTALS}
                colId={attributeColumnId}
                getTableDescriptor={getTableDescriptor}
                getExecutionDefinition={getExecutionDefinition}
                getColumnTotals={getColumnTotals}
                getRowTotals={getRowTotals}
                onMenuOpenedChange={onMenuOpenedChange}
                onAggregationSelect={onAggregationSelect}
                {...customProps}
            />,
        );
        console.log("TEST FILE: render completed");
        return result;
    }
    const tableHeaderSelector = ".s-table-header-menu";

    beforeEach(() => {
        console.log("TEST FILE: beforeEach called");
        vi.clearAllMocks();
        console.log("TEST FILE: mocks cleared");

        vi.spyOn(window, "addEventListener").mockImplementation((...args) => {
            if (args[0] === "scroll") {
                // Ignore scroll listeners
                return;
            }
            window.addEventListener(...args); // fallback for other events
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("basic sanity check", () => {
        console.log("TEST FILE: Inside basic sanity check");
        expect(true).toBe(true);
    });

    it("should render opened main menu", () => {
        console.log("TEST FILE: Starting test 'should render opened main menu'");
        console.log("TEST FILE: About to call renderComponent");
        try {
            renderComponent({
                onMenuOpenedChange: vi.fn(),
                closeOnScroll: false,
            });
            console.log("TEST FILE: Component rendered successfully");
        } catch (error) {
            console.log("TEST FILE: Error rendering component:", error);
            throw error;
        }
        console.log("TEST FILE: Querying for menu");
        const menu = document.querySelector(tableHeaderSelector);
        console.log("TEST FILE: Menu selected:", menu);

        expect(menu).toBeInTheDocument();
        expect(menu).toHaveClass("gd-pivot-table-header-menu--open");
        console.log("TEST FILE: Test completed");
    });

    it("minimal test - just render", () => {
        console.log("MINIMAL TEST: Starting");
        console.log("MINIMAL TEST: About to create element");
        const element = (
            <div>
                <AggregationsMenu
                    intl={intlMock}
                    isMenuOpened={true}
                    isMenuButtonVisible={true}
                    showSubmenu={false}
                    showColumnsSubMenu={false}
                    availableTotalTypes={AVAILABLE_TOTALS}
                    colId={attributeColumnId}
                    getTableDescriptor={getTableDescriptor}
                    getExecutionDefinition={getExecutionDefinition}
                    getColumnTotals={getColumnTotals}
                    getRowTotals={getRowTotals}
                    onMenuOpenedChange={onMenuOpenedChange}
                    onAggregationSelect={onAggregationSelect}
                />
            </div>
        );
        console.log("MINIMAL TEST: Element created");
        console.log("MINIMAL TEST: About to render");
        const { container } = render(element);
        console.log("MINIMAL TEST: Render completed, container:", container);
    });

    it("should render main menu with all total items", () => {
        renderComponent();

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(AVAILABLE_TOTALS.length);
    });

    it("should render main menu and submenu with only available total items", () => {
        renderComponent({ availableTotalTypes: ["sum", "avg"], showSubmenu: true });

        expect(document.querySelectorAll(".s-menu-aggregation")).toHaveLength(2);
    });

    it("should render closed main menu when isMenuOpen is set to false", () => {
        renderComponent({ isMenuOpened: false });

        const tableHeader = document.querySelector(tableHeaderSelector);
        expect(tableHeader).not.toHaveClass("gd-pivot-table-header-menu--open");
        expect(tableHeader).toHaveClass("gd-pivot-table-header-menu--show");
    });

    it("should render visible main menu button", () => {
        renderComponent();

        const tableHeader = document.querySelector(tableHeaderSelector);
        expect(tableHeader).toHaveClass("gd-pivot-table-header-menu--open");
        expect(tableHeader).toHaveClass("gd-pivot-table-header-menu--show");
    });

    it("should render invisible visible main menu button", () => {
        renderComponent({ isMenuButtonVisible: false });

        const tableHeader = document.querySelector(tableHeaderSelector);
        expect(tableHeader).toHaveClass("gd-pivot-table-header-menu--open");
        expect(tableHeader).toHaveClass("gd-pivot-table-header-menu--hide");
    });

    it("should render submenu with correct props", () => {
        renderComponent({
            isMenuButtonVisible: false,
            showSubmenu: true,
        });

        expect(AggregationsSubMenu).toHaveBeenCalledWith(
            expect.objectContaining({
                totalType: "sum",
                rowAttributeDescriptors: [
                    expect.objectContaining({ attributeHeader: expect.anything() }),
                    expect.objectContaining({ attributeHeader: expect.anything() }),
                ],
                columnTotals: [],
            }),
            {},
        );
    });

    it("should render menu when table has column attributes but not rows", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(fixture, "empty value");

        renderComponent({
            getTableDescriptor: () => tableDescriptor,
            showColumnsSubMenu: true,
        });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(AVAILABLE_TOTALS.length);
    });

    it("should not disable any item when there is no measure value filter set", () => {
        const defWithAttrFilter = defWithFilters(emptyDef("testWorkspace"), [
            newPositiveAttributeFilter(idRef("some-identifier"), ["e1", "e2"]),
        ]);
        renderComponent({
            showSubmenu: true,
            getExecutionDefinition: () => defWithAttrFilter,
        });
        expect(document.querySelectorAll(".is-disabled")).toHaveLength(0);
        expect(AggregationsSubMenu).toHaveBeenCalledTimes(6);
    });

    it("should disable native totals when there is at least one measure value filter set", () => {
        const defWithMeasureValueFilter = defWithFilters(emptyDef("testWorkspace"), [
            newMeasureValueFilter(localIdRef("some-localIdentifier"), "GREATER_THAN", 10),
        ]);

        renderComponent({
            showSubmenu: true,
            getExecutionDefinition: () => defWithMeasureValueFilter,
        });
        expect(document.querySelectorAll(".is-disabled")).toHaveLength(1);
        expect(AggregationsSubMenu).toHaveBeenCalledTimes(5);
    });

    it("should disable native totals when there is ranking filter set", () => {
        const defWithRankingFilter = defWithFilters(emptyDef("testWorkspace"), [
            newRankingFilter(localIdRef("some-localIdentifier"), "TOP", 3),
        ]);

        renderComponent({
            showSubmenu: true,
            getExecutionDefinition: () => defWithRankingFilter,
        });
        expect(document.querySelectorAll(".is-disabled")).toHaveLength(1);
        expect(AggregationsSubMenu).toHaveBeenCalledTimes(5);
    });

    it("should close on scroll", () => {
        const onMenuOpenedChange = vi.fn();
        renderComponent({ onMenuOpenedChange });
        act(() => {
            window.dispatchEvent(new Event("scroll"));
        });
        expect(onMenuOpenedChange).toHaveBeenCalledWith({ opened: false, source: "SCROLL" });
    });
});
