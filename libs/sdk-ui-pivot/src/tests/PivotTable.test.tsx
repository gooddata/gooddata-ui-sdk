// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { PivotTable, pivotTableMenuForCapabilities } from "../PivotTable.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IMeasure } from "@gooddata/sdk-model";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import { IMenu } from "../publicTypes.js";
import { describe, it, expect } from "vitest";

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
        return render(
            <PivotTable
                backend={dummyBackend()}
                workspace="testWorkspace"
                measures={[measure]}
                {...customProps}
            />,
        );
    }

    it("should render with custom SDK", () => {
        renderShallowComponent();
        expect(document.querySelector(".gd-table-component")).toBeInTheDocument();
    });
});

describe("pivotTableMenuForCapabilities", () => {
    const NoGrandTotals: IBackendCapabilities = {
        canCalculateGrandTotals: false,
    };

    const NoSubTotalsAndNativeTotals: IBackendCapabilities = {
        canCalculateGrandTotals: true,
        canCalculateSubTotals: false,
        canCalculateNativeTotals: false,
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
            { aggregations: true },
        ],
        [
            "limit total types in default menu when no subtotals and no native totals capability",
            NoSubTotalsAndNativeTotals,
            {},
        ],
        [
            "limit total types in menu when no subtotals and no native totals capability",
            NoSubTotalsAndNativeTotals,
            { aggregations: true },
        ],
        [
            "disable aggregations when no available total types left",
            NoSubTotalsAndNativeTotals,
            { aggregations: true, aggregationTypes: ["nat"] },
        ],
        ["keep default menu config as is if all capabilities", AllCapabilities, {}],
        ["keep menu config as is if all capabilities", AllCapabilities, { aggregations: true }],
    ];

    it.each(Scenarios)("should %s", (_desc, capabilities, menu) => {
        expect(pivotTableMenuForCapabilities(capabilities, menu)).toMatchSnapshot();
    });
});
