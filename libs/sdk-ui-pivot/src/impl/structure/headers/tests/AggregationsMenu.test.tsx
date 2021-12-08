// (C) 2019-2021 GoodData Corporation
import { mount } from "enzyme";
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

describe("AggregationsMenu", () => {
    const intlMock = createIntlMock();
    const attributeColumnId = "c_0";
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndOneColumnAttributes,
        DataViewFirstPage,
    );
    const tableDescriptor = TableDescriptor.for(fixture);
    const getExecutionDefinition = () => emptyDef("testWorkspace");
    const getTotals = () => [] as ITotal[];
    const getTableDescriptor = () => tableDescriptor;
    const onMenuOpenedChange = jest.fn();
    const onAggregationSelect = jest.fn();

    function render(customProps: Partial<IAggregationsMenuProps> = {}) {
        return mount(
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

    it("should render opened main menu", () => {
        const wrapper = render();
        const menu = wrapper.find(".s-table-header-menu");

        expect(menu.length).toBe(1);
        expect(menu.hasClass("gd-pivot-table-header-menu--open")).toBe(true);
    });

    it("should render main menu with all total items", () => {
        const wrapper = render();

        expect(wrapper.find(".s-menu-aggregation").length).toBe(AVAILABLE_TOTALS.length);
    });

    it("should render main menu with only available total items", () => {
        const wrapper = render({ availableTotalTypes: ["sum", "avg"] });

        expect(wrapper.find(".s-menu-aggregation").length).toBe(2);
    });

    it("should render main menu with submenu with only available total items", () => {
        const wrapper = render({ availableTotalTypes: ["sum", "avg"], showSubmenu: true });

        expect(wrapper.find(".s-menu-aggregation").length).toBe(2);
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
        const wrapper = render({ getTotals: () => totals });

        expect(wrapper.find(".is-checked").length).toBe(1);
        expect(wrapper.find(".s-menu-aggregation-sum .is-checked").length).toBe(1);
    });

    it("should render closed main menu when isMenuOpen is set to false", () => {
        const wrapper = render({ isMenuOpened: false });

        expect(wrapper.find(".s-table-header-menu").hasClass("gd-pivot-table-header-menu--open")).toBe(false);
    });

    it("should render visible main menu button", () => {
        const wrapper = render();

        expect(wrapper.find(".s-table-header-menu").hasClass("gd-pivot-table-header-menu--show")).toBe(true);
    });

    it("should render invisible visible main menu button", () => {
        const wrapper = render({ isMenuButtonVisible: false });

        expect(wrapper.find(".s-table-header-menu").hasClass("gd-pivot-table-header-menu--hide")).toBe(true);
    });

    it("should render submenu with correct props", () => {
        const wrapper = render({
            isMenuButtonVisible: false,
            showSubmenu: true,
        });
        const subMenu = wrapper.find(".s-menu-aggregation-sum").find(AggregationsSubMenu);

        expect(subMenu.props()).toMatchObject({
            totalType: "sum",
            rowAttributeDescriptors: [
                expect.objectContaining({ attributeHeader: expect.anything() }),
                expect.objectContaining({ attributeHeader: expect.anything() }),
            ],
            columnTotals: [],
        });
    });

    it("should not render any submenu when there is no row attribute", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(fixture);

        const wrapper = render({
            showSubmenu: true,
            getTableDescriptor: () => tableDescriptor,
        });

        expect(wrapper.find(AggregationsSubMenu).length).toBe(0);
    });

    it("should not disable any item when there is no measure value filter set", () => {
        const defWithAttrFilter = defWithFilters(emptyDef("testWorkspace"), [
            newPositiveAttributeFilter(idRef("some-identifier"), ["e1", "e2"]),
        ]);
        const wrapper = render({
            showSubmenu: true,
            getExecutionDefinition: () => defWithAttrFilter,
        });
        expect(wrapper.find(".is-disabled").length).toBe(0);
        expect(wrapper.find(AggregationsSubMenu).length).toBe(6);
    });

    it("should disable native totals when there is at least one measure value filter set", () => {
        const defWithMeasureValueFilter = defWithFilters(emptyDef("testWorkspace"), [
            newMeasureValueFilter(localIdRef("some-localIdentifier"), "GREATER_THAN", 10),
        ]);

        const wrapper = render({
            showSubmenu: true,
            getExecutionDefinition: () => defWithMeasureValueFilter,
        });
        expect(wrapper.find(".is-disabled").length).toBe(1);
        expect(wrapper.find(AggregationsSubMenu).length).toBe(5);
    });

    it("should disable native totals when there is ranking filter set", () => {
        const defWithRankingFilter = defWithFilters(emptyDef("testWorkspace"), [
            newRankingFilter(localIdRef("some-localIdentifier"), "TOP", 3),
        ]);

        const wrapper = render({
            showSubmenu: true,
            getExecutionDefinition: () => defWithRankingFilter,
        });
        expect(wrapper.find(".is-disabled").length).toBe(1);
        expect(wrapper.find(AggregationsSubMenu).length).toBe(5);
    });

    it("should close on scroll", () => {
        const onMenuOpenedChange = jest.fn();
        render({ onMenuOpenedChange });
        window.dispatchEvent(new Event("scroll"));
        expect(onMenuOpenedChange).toHaveBeenCalledWith({ opened: false, source: "SCROLL" });
    });
});
