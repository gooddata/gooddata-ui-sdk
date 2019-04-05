// (C) 2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { mount } from "enzyme";
import * as React from "react";
import { EXECUTION_RESPONSE_2A_3M } from "../../../visualizations/table/fixtures/2attributes3measures";
import { EXECUTION_RESPONSE_2M } from "../../../visualizations/table/fixtures/2measures";
import { AVAILABLE_TOTALS } from "../../../visualizations/table/totals/utils";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";
import AggregationsMenu, { IAggregationsMenuProps } from "../AggregationsMenu";
import AggregationsSubMenu from "../AggregationsSubMenu";

describe("AggregationsMenu", () => {
    const intlMock = createIntlMock();
    const attributeColumnId = "a_6_2-m_0";
    const getExecutionResponse = () => EXECUTION_RESPONSE_2A_3M;
    const getTotals = () => [] as AFM.ITotalItem[];
    const onMenuOpenedChange = jest.fn();
    const onAggregationSelect = jest.fn();

    function render(customProps: Partial<IAggregationsMenuProps> = {}) {
        return mount(
            <AggregationsMenu
                intl={intlMock}
                isMenuOpened={true}
                isMenuButtonVisible={true}
                showSubmenu={false}
                colId={attributeColumnId}
                getExecutionResponse={getExecutionResponse}
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

    it('should render "sum" as only selected item', () => {
        const totals: AFM.ITotalItem[] = [
            {
                type: "sum",
                attributeIdentifier: "1st_attr_df_local_identifier",
                measureIdentifier: "1st_measure_local_identifier",
            },
            {
                type: "min",
                attributeIdentifier: "2nd_attr_df_local_identifier",
                measureIdentifier: "1st_measure_local_identifier",
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
            rowAttributeHeaders: [
                expect.objectContaining({ attributeHeader: expect.anything() }),
                expect.objectContaining({ attributeHeader: expect.anything() }),
            ],
            columnTotals: [],
        });
    });

    it("should not render any submenu when there is no row attribute", () => {
        const wrapper = render({
            showSubmenu: true,
            getExecutionResponse: () => EXECUTION_RESPONSE_2M,
        });

        expect(wrapper.find(AggregationsSubMenu).length).toBe(0);
    });
});
