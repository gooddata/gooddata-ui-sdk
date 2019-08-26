// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { Table } from "../Table";
import { SortableTable } from "../../core/SortableTable";
import { dummyExecuteAfmAdapterFactoryTable } from "./utils/DummyExecuteAfmAdapter";
import {
    executionRequest,
    executionRequestWithEmptyMeasuresArray,
    executionRequestWithoutMeasureAndWithoutResultSpec,
} from "./utils/dummyFixture";

describe("Table", () => {
    it("should provide default resultSpec to the core Table with attribute and measure", () => {
        const wrapper = mount(
            <Table
                projectId="prId"
                afm={executionRequest.execution.afm}
                adapterFactory={dummyExecuteAfmAdapterFactoryTable}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(SortableTable).props().resultSpec.dimensions;

            expect(dimensions).toEqual([
                { itemIdentifiers: ["departmentAttribute"] },
                { itemIdentifiers: ["measureGroup"] },
            ]);
        });
    });

    it("should provide default resultSpec to the core Table with no measure (with only attributes)", () => {
        const wrapper = mount(
            <Table
                projectId="projectId"
                afm={executionRequestWithoutMeasureAndWithoutResultSpec.execution.afm}
                adapterFactory={dummyExecuteAfmAdapterFactoryTable}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(SortableTable).props().resultSpec.dimensions;

            expect(dimensions).toEqual([
                { itemIdentifiers: ["departmentAttribute"] },
                { itemIdentifiers: [] },
            ]);
        });
    });

    it("should provide default resultSpec to the core Table when afm.measures=[]", () => {
        const wrapper = mount(
            <Table
                projectId="projectId"
                afm={executionRequestWithEmptyMeasuresArray.execution.afm}
                adapterFactory={dummyExecuteAfmAdapterFactoryTable}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(SortableTable).props().resultSpec.dimensions;

            expect(dimensions).toEqual([
                { itemIdentifiers: ["departmentAttribute"] },
                { itemIdentifiers: [] },
            ]);
        });
    });
});
