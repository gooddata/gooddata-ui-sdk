// (C) 2007-2018 GoodData Corporation
import { mount } from "enzyme";
import React from "react";
import { createIntlMock } from "@gooddata/sdk-ui";
import AggregationsSubMenu, { IAggregationsSubMenuProps } from "../AggregationsSubMenu";
import { IColumnTotal } from "../aggregationsMenuTypes";

describe("AggregationsSubMenu", () => {
    const intlMock = createIntlMock();
    const attributeHeaders = [
        {
            attributeHeader: {
                formOf: {
                    identifier: "1st_attr_local_identifier",
                    name: "Department",
                    uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                },
                identifier: "1st_attr_df_identifier",
                localIdentifier: "1st_attr_df_local_identifier",
                name: "Department Name",
                uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
            },
        },
        {
            attributeHeader: {
                formOf: {
                    identifier: "2nd_attr_local_identifier",
                    name: "Region",
                    uri: "/gdc/md/project_id/obj/2nd_attr_uri_id",
                },
                identifier: "2nd_attr_df_identifier",
                localIdentifier: "2nd_attr_df_local_identifier",
                name: "Region Area",
                uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id",
            },
        },
    ];

    function render(customProps: Partial<IAggregationsSubMenuProps> = {}) {
        const onAggregationSelect = jest.fn();
        return mount(
            <AggregationsSubMenu
                intl={intlMock}
                totalType="sum"
                rowAttributeDescriptors={attributeHeaders}
                columnTotals={[]}
                measureLocalIdentifiers={["m1"]}
                onAggregationSelect={onAggregationSelect}
                toggler={<div>Open submenu</div>}
                isMenuOpened={true}
                {...customProps}
            />,
        );
    }

    it("should render closed submenu when isMenuOpened is set to false", () => {
        const wrapper = render({ isMenuOpened: false });

        expect(wrapper.find(".gd-aggregation-menu-item-inner").length).toBe(0);
    });

    it('should render submenu with attributes, first attribute as "All rows"', () => {
        const wrapper = render({
            intl: createIntlMock({
                "visualizations.menu.aggregations.all-rows": "all rows",
            }),
        });
        const items = wrapper.find(".gd-aggregation-menu-item-inner");

        expect(items.length).toBe(2);
        expect(items.at(0).text()).toBe("all rows");
        expect(items.at(1).text()).toBe("within Department");
    });

    it("should render both attributes as selected", () => {
        const columnTotals: IColumnTotal[] = [
            {
                type: "sum",
                attributes: ["1st_attr_df_local_identifier", "2nd_attr_df_local_identifier"],
            },
        ];
        const wrapper = render({ columnTotals });

        expect(wrapper.find(".is-checked").length).toBe(2);
    });

    it("should call onAggregationSelect callback when clicked on submenu item", () => {
        const onAggregationSelect = jest.fn();
        const wrapper = render({ onAggregationSelect });

        wrapper.find(".gd-aggregation-menu-item-inner").at(1).simulate("click");

        expect(onAggregationSelect).toHaveBeenCalledTimes(1);
        expect(onAggregationSelect).toHaveBeenCalledWith({
            attributeIdentifier: "2nd_attr_df_local_identifier",
            include: true,
            measureIdentifiers: ["m1"],
            type: "sum",
        });
    });
});
