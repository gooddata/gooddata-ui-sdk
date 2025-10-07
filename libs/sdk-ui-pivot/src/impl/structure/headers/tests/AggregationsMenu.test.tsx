// (C) 2019-2025 GoodData Corporation

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import {
    ITotal,
    defWithFilters,
    emptyDef,
    idRef,
    localIdRef,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { AVAILABLE_TOTALS } from "../../../base/constants.js";
import { TableDescriptor } from "../../tableDescriptor.js";
import AggregationsMenu, { IAggregationsMenuProps } from "../AggregationsMenu.js";
import AggregationsSubMenu from "../AggregationsSubMenu.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../AggregationsSubMenu", () => ({
    __esModule: true,
    default: vi.fn(() => null),
}));

const intlMock = createIntlMock({
    "visualizations.totals.dropdown.tooltip.nat.disabled.ranking": "Tooltip 1",
    "visualizations.totals.dropdown.tooltip.nat.disabled.mvf": "Tooltip 2",
});

describe("AggregationsMenu", () => {
    const attributeColumnId = "c_0";
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable
            .SingleMeasureWithTwoRowAndTwoColumnAttributes as ScenarioRecording,
        DataViewFirstPage,
    );
    const tableDescriptor = TableDescriptor.for(fixture, "empty value");
    const getExecutionDefinition = () => emptyDef("testWorkspace");
    const getColumnTotals = () => [] as ITotal[];
    const getRowTotals = () => [] as ITotal[];
    const getTableDescriptor = () => tableDescriptor;
    const onMenuOpenedChange = vi.fn();
    const onAggregationSelect = vi.fn();

    function renderComponent(customProps: Partial<IAggregationsMenuProps> = {}) {
        return render(
            <AggregationsMenu
                intl={intlMock}
                isMenuOpened
                isMenuButtonVisible
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
    }
    const tableHeaderSelector = ".s-table-header-menu";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render opened main menu", () => {
        renderComponent();
        const menu = document.querySelector(tableHeaderSelector);

        expect(menu).toBeInTheDocument();
        expect(menu).toHaveClass("gd-pivot-table-header-menu--open");
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
            undefined,
        );
    });

    it("should render menu when table has column attributes but not rows", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute as ScenarioRecording,
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
