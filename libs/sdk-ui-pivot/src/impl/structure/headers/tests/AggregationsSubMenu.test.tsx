// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IAttributeDescriptor, uriRef } from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";

import { IColumnTotal } from "../aggregationsMenuTypes.js";
import AggregationsSubMenu, { IAggregationsSubMenuProps } from "../AggregationsSubMenu.js";

const intlMock = createIntlMock();

describe("AggregationsSubMenu", () => {
    const rowAttributeHeaders: IAttributeDescriptor[] = [
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
    ] as unknown as IAttributeDescriptor[];

    const columnAttributeHeaders: IAttributeDescriptor[] = [
        {
            attributeHeader: {
                formOf: {
                    identifier: "3rd_attr_local_identifier",
                    name: "Forecast Category",
                    uri: "/gdc/md/project_id/obj/3rd_attr_uri_id",
                    ref: uriRef("/gdc/md/project_id/obj/3rd_attr_uri_id"),
                },
                identifier: "3rd_attr_df_identifier",
                localIdentifier: "3rd_attr_df_local_identifier",
                name: "Forecast Category",
                uri: "/gdc/md/project_id/obj/3rd_attr_df_uri_id",
                ref: uriRef("/gdc/md/project_id/obj/3rd_attr_df_uri_id"),
            },
        },
        {
            attributeHeader: {
                formOf: {
                    identifier: "4th_attr_local_identifier",
                    name: "Stage Name",
                    uri: "/gdc/md/project_id/obj/4th_attr_uri_id",
                    ref: uriRef("/gdc/md/project_id/obj/4th_attr_uri_id"),
                },
                identifier: "4th_attr_df_identifier",
                localIdentifier: "4th_attr_df_local_identifier",
                name: "Stage Name",
                uri: "/gdc/md/project_id/obj/4th_attr_df_uri_id",
                ref: uriRef("/gdc/md/project_id/obj/4th_attr_df_uri_id"),
            },
        },
    ] as unknown as IAttributeDescriptor[];

    function renderComponent(customProps: Partial<IAggregationsSubMenuProps> = {}) {
        const onAggregationSelect = vi.fn();
        return render(
            <AggregationsSubMenu
                intl={intlMock}
                totalType="sum"
                rowAttributeDescriptors={rowAttributeHeaders}
                columnAttributeDescriptors={columnAttributeHeaders}
                columnTotals={[]}
                rowTotals={[]}
                measureLocalIdentifiers={["m1"]}
                onAggregationSelect={onAggregationSelect}
                toggler={<div>Open submenu</div>}
                showColumnsSubMenu={true}
                isMenuOpened={true}
                {...customProps}
            />,
        );
    }

    it("should render closed submenu when isMenuOpened is set to false", () => {
        renderComponent({ isMenuOpened: false });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(0);
    });

    it("should render submenu with attributes, for rows only", () => {
        renderComponent({
            showColumnsSubMenu: false,
            intl: createIntlMock({
                "visualizations.menu.aggregations.all-rows": "all rows",
            }),
        });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(2);
        expect(screen.getByText("all rows")).toBeInTheDocument();
        expect(screen.getByText("within Department")).toBeInTheDocument();
    });

    it("should render submenu with attributes, for columns only", () => {
        renderComponent({
            rowAttributeDescriptors: [],
            intl: createIntlMock({
                "visualizations.menu.aggregations.all-columns": "all columns",
            }),
        });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(2);
        expect(screen.getByText("all columns")).toBeInTheDocument();
        expect(screen.getByText("within Forecast Category")).toBeInTheDocument();
    });

    it("should render submenu with attributes, for rows and columns", () => {
        renderComponent({
            intl: createIntlMock({
                "visualizations.menu.aggregations.all-rows": "all rows",
                "visualizations.menu.aggregations.all-columns": "all columns",
            }),
        });

        expect(document.querySelectorAll(".s-menu-aggregation-inner")).toHaveLength(4);
        expect(screen.getByText("all rows")).toBeInTheDocument();
        expect(screen.getByText("within Department")).toBeInTheDocument();
        expect(screen.getByText("all columns")).toBeInTheDocument();
        expect(screen.getByText("within Forecast Category")).toBeInTheDocument();
    });

    it("should render all attributes as selected", () => {
        const columnTotals: IColumnTotal[] = [
            {
                type: "sum",
                attributes: ["1st_attr_df_local_identifier", "2nd_attr_df_local_identifier"],
            },
        ];

        const rowTotals: IColumnTotal[] = [
            {
                type: "sum",
                attributes: ["3rd_attr_df_local_identifier", "4th_attr_df_local_identifier"],
            },
        ];
        renderComponent({ columnTotals, rowTotals });

        expect(document.querySelectorAll(".is-checked")).toHaveLength(4);
    });

    it("should call onAggregationSelect callback when clicked on submenu row item", () => {
        const onAggregationSelect = vi.fn();
        renderComponent({ onAggregationSelect });

        fireEvent.click(screen.getByText("within Department"));

        expect(onAggregationSelect).toHaveBeenCalledTimes(1);
        expect(onAggregationSelect).toHaveBeenCalledWith({
            attributeIdentifier: "2nd_attr_df_local_identifier",
            include: true,
            measureIdentifiers: ["m1"],
            type: "sum",
            isColumn: true,
        });
    });

    it("should call onAggregationSelect callback when clicked on submenu column item", () => {
        const onAggregationSelect = vi.fn();
        renderComponent({ onAggregationSelect });

        fireEvent.click(screen.getByText("within Forecast Category"));

        expect(onAggregationSelect).toHaveBeenCalledTimes(1);
        expect(onAggregationSelect).toHaveBeenCalledWith({
            attributeIdentifier: "4th_attr_df_local_identifier",
            include: true,
            measureIdentifiers: ["m1"],
            type: "sum",
            isColumn: false,
        });
    });
});
