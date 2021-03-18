// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { PivotTable, pivotTableMenuForCapabilities } from "../PivotTable";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IMeasure } from "@gooddata/sdk-model";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import { IMenu } from "../publicTypes";

describe("PivotTable", () => {
    const measure: IMeasure = {
        measure: {
            localIdentifier: "m1",
            definition: {
                measureDefinition: {
                    item: {
                        identifier: "xyz123",
                    },
                },
            },
        },
    };

    function renderShallowComponent(customProps = {}) {
        return shallow(
            <PivotTable
                backend={dummyBackend()}
                workspace="testWorkspace"
                measures={[measure]}
                {...customProps}
            />,
        );
    }

    it("should render with custom SDK", () => {
        const wrapper = renderShallowComponent();
        expect(wrapper).toHaveLength(1);
    });
});

describe("pivotTableMenuForCapabilities", () => {
    const NoGrandTotals: IBackendCapabilities = {
        canCalculateGrandTotals: false,
    };

    const NoSubTotals: IBackendCapabilities = {
        canCalculateGrandTotals: true,
        canCalculateSubTotals: false,
        canCalculateNativeTotals: true,
    };

    const NoSubTotalsAndNativeTotals: IBackendCapabilities = {
        canCalculateGrandTotals: true,
        canCalculateSubTotals: false,
        canCalculateNativeTotals: false,
    };

    const NoGrandTotalsButSubTotals: IBackendCapabilities = {
        canCalculateGrandTotals: false,
        canCalculateSubTotals: true,
        canCalculateNativeTotals: true,
    };

    const AllCapabilities: IBackendCapabilities = {
        canCalculateGrandTotals: true,
        canCalculateSubTotals: true,
        canCalculateNativeTotals: true,
    };

    const Scenarios: Array<[string, IBackendCapabilities, IMenu]> = [
        ["disable aggregations in default menu when no grand totals capability", NoGrandTotals, {}],
        [
            "disable aggregations in menu when no grand totals capability",
            NoGrandTotals,
            { aggregations: true, aggregationsSubMenu: true },
        ],
        [
            "disable aggregations in default menu when no grand totals capability even if subtotals capability is available",
            NoGrandTotalsButSubTotals,
            {},
        ],
        [
            "disable aggregations in menu when no grand totals capability even if subtotals capability is available",
            NoGrandTotalsButSubTotals,
            { aggregations: true, aggregationsSubMenu: true },
        ],
        ["disable subtotals in default menu when no subtotals capability", NoSubTotals, {}],
        [
            "disable subtotals in menu when no subtotals capability",
            NoSubTotals,
            { aggregations: true, aggregationsSubMenu: true },
        ],
        [
            "disable subtotals and limit total types in default menu when no subtotals and no native totals capability",
            NoSubTotalsAndNativeTotals,
            {},
        ],
        [
            "disable subtotals and limit total types in menu when no subtotals and no native totals capability",
            NoSubTotalsAndNativeTotals,
            { aggregations: true, aggregationsSubMenu: true },
        ],
        [
            "disable aggregations when no available total types left",
            NoSubTotalsAndNativeTotals,
            { aggregations: true, aggregationsSubMenu: true, aggregationTypes: ["nat"] },
        ],
        ["keep default menu config as is if all capabilities", AllCapabilities, {}],
        [
            "keep menu config as is if all capabilities",
            AllCapabilities,
            { aggregations: true, aggregationsSubMenu: true },
        ],
    ];

    it.each(Scenarios)("should %s", (_desc, capabilities, menu) => {
        expect(pivotTableMenuForCapabilities(capabilities, menu)).toMatchSnapshot();
    });
});
