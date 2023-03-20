// (C) 2019-2023 GoodData Corporation
import { render } from "@testing-library/react";
import React from "react";
import { createIntlMock } from "@gooddata/sdk-ui";
import AggregationsMenu, { IAggregationsMenuProps } from "../AggregationsMenu";
import AggregationsSubMenu from "../AggregationsSubMenu";
import { AVAILABLE_TOTALS } from "../../../base/constants";
import {
    attributeLocalId,
    defWithFilters,
    emptyDef,
    ITotal,
    measureLocalId,
    newPositiveAttributeFilter,
    idRef,
    localIdRef,
    newMeasureValueFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { TableDescriptor } from "../../tableDescriptor";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../AggregationsSubMenu", () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

const intlMock = createIntlMock({
    "visualizations.totals.dropdown.tooltip.nat.disabled.ranking": "Tooltip 1",
    "visualizations.totals.dropdown.tooltip.nat.disabled.mvf": "Tooltip 2",
});

describe("AggregationsMenu", () => {
    const attributeColumnId = "c_0";
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndOneColumnAttributes,
        DataViewFirstPage,
    );
    const tableDescriptor = TableDescriptor.for(fixture, "empty value");
    const getExecutionDefinition = () => emptyDef("testWorkspace");
    const getTotals = () => [] as ITotal[];
    const getTableDescriptor = () => tableDescriptor;
    const onMenuOpenedChange = jest.fn();
    const onAggregationSelect = jest.fn();

    function renderComponent(customProps: Partial<IAggregationsMenuProps> = {}) {
        return render(
            <AggregationsMenu
                intl={intlMock}
                isMenuOpened={true}
                isMenuButtonVisible={true}
                showSubmenu={false}
                availableTotalTypes={AVAILABLE_TOTALS}
                colId={attributeColumnId}
                getTableDescriptor={getTableDescriptor}
                getExecutionDefinition={getExecutionDefinition}
                getTotals={getTotals}
                onMenuOpenedChange={onMenuOpenedChange}
                onAggregationSelect={onAggregationSelect}
                {...customProps}
            />,
        );
    }
    const tableHeaderSelector = ".s-table-header-menu";

    beforeEach(() => {
        jest.clearAllMocks();
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

    it("should render main menu with only available total items", () => {
        renderComponent({ availableTotalTypes: ["sum", "avg"] });

        expect(document.querySelectorAll(".s-menu-aggregation")).toHaveLength(2);
    });

    it("should render main menu with submenu with only available total items", () => {
        renderComponent({ availableTotalTypes: ["sum", "avg"], showSubmenu: true });

        expect(document.querySelectorAll(".s-menu-aggregation")).toHaveLength(2);
    });

    it('should render "sum" as only selected item in main menu', () => {
        const totals: ITotal[] = [
            {
                type: "sum",
                attributeIdentifier: attributeLocalId(ReferenceMd.Product.Name), // first row attribute => grand totals, selected right in menu
                measureIdentifier: measureLocalId(ReferenceMd.Amount),
            },
            {
                type: "min",
                attributeIdentifier: attributeLocalId(ReferenceMd.Department), // second row attr => subtotals, selected in submenu
                measureIdentifier: measureLocalId(ReferenceMd.Amount),
            },
        ];
        renderComponent({ getTotals: () => totals });

        expect(document.querySelectorAll(".is-checked")).toHaveLength(1);
        expect(document.querySelectorAll(".s-menu-aggregation-sum .is-checked")).toHaveLength(1);
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

    it("should not render any submenu when there is no row attribute", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(fixture, "empty value");

        renderComponent({
            showSubmenu: true,
            getTableDescriptor: () => tableDescriptor,
        });

        expect(AggregationsSubMenu).toHaveBeenCalledTimes(0);
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
        const onMenuOpenedChange = jest.fn();
        renderComponent({ onMenuOpenedChange });
        window.dispatchEvent(new Event("scroll"));
        expect(onMenuOpenedChange).toHaveBeenCalledWith({ opened: false, source: "SCROLL" });
    });
});
