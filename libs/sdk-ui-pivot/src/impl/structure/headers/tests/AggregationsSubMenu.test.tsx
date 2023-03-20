// (C) 2007-2023 GoodData Corporation
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { createIntlMock } from "@gooddata/sdk-ui";
import AggregationsSubMenu, { IAggregationsSubMenuProps } from "../AggregationsSubMenu";
import { IColumnTotal } from "../aggregationsMenuTypes";
import { uriRef } from "@gooddata/sdk-model";

const intlMock = createIntlMock();

describe("AggregationsSubMenu", () => {
    const attributeHeaders = [
        {
            attributeHeader: {
                formOf: {
                    identifier: "1st_attr_local_identifier",
                    name: "Department",
                    uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                    ref: uriRef("/gdc/md/project_id/obj/1st_attr_uri_id"),
                },
                identifier: "1st_attr_df_identifier",
                localIdentifier: "1st_attr_df_local_identifier",
                name: "Department Name",
                uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                ref: uriRef("/gdc/md/project_id/obj/1st_attr_df_uri_id"),
            },
        },
        {
            attributeHeader: {
                formOf: {
                    identifier: "2nd_attr_local_identifier",
                    name: "Region",
                    uri: "/gdc/md/project_id/obj/2nd_attr_uri_id",
                    ref: uriRef("/gdc/md/project_id/obj/2nd_attr_uri_id"),
                },
                identifier: "2nd_attr_df_identifier",
                localIdentifier: "2nd_attr_df_local_identifier",
                name: "Region Area",
                uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id",
                ref: uriRef("/gdc/md/project_id/obj/2nd_attr_df_uri_id"),
            },
        },
    ];

    function renderComponent(customProps: Partial<IAggregationsSubMenuProps> = {}) {
        const onAggregationSelect = jest.fn();
        return render(
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
        renderComponent({ isMenuOpened: false });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(0);
    });

    it('should render submenu with attributes, first attribute as "All rows"', () => {
        renderComponent({
            intl: createIntlMock({
                "visualizations.menu.aggregations.all-rows": "all rows",
            }),
        });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(2);
        expect(screen.getByText("all rows")).toBeInTheDocument();
        expect(screen.getByText("within Department")).toBeInTheDocument();
    });

    it("should render both attributes as selected", () => {
        const columnTotals: IColumnTotal[] = [
            {
                type: "sum",
                attributes: ["1st_attr_df_local_identifier", "2nd_attr_df_local_identifier"],
            },
        ];
        renderComponent({ columnTotals });

        expect(document.querySelectorAll(".is-checked")).toHaveLength(2);
    });

    it("should call onAggregationSelect callback when clicked on submenu item", () => {
        const onAggregationSelect = jest.fn();
        renderComponent({ onAggregationSelect });

        fireEvent.click(screen.getByText("within Department"));

        expect(onAggregationSelect).toHaveBeenCalledTimes(1);
        expect(onAggregationSelect).toHaveBeenCalledWith({
            attributeIdentifier: "2nd_attr_df_local_identifier",
            include: true,
            measureIdentifiers: ["m1"],
            type: "sum",
        });
    });
});
