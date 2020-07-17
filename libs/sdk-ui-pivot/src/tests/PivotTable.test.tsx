// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { PivotTable } from "../PivotTable";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IMeasure } from "@gooddata/sdk-model";

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
