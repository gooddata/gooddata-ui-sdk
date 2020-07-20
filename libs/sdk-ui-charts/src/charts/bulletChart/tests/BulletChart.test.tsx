// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { BulletChart } from "../BulletChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import {
    attributeLocalId,
    MeasureGroupIdentifier,
    newAttributeSort,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { CoreBulletChart } from "../CoreBulletChart";

describe("BarChart", () => {
    it("should render column chart and create correct stacking dimensions", () => {
        // note: this test was previously verifying that AFM is created correctly; that is pointless now as the
        //  transformation is tested elsewhere. the important thing to test is that dimensions are built as expected.
        const wrapper = mount(
            <BulletChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasure={ReferenceLdm.Won}
                viewBy={[ReferenceLdm.Product.Name]}
                sortBy={[newAttributeSort(ReferenceLdm.Product.Name, "asc")]}
            />,
        );

        const exceptedDimensions = newTwoDimensional(
            [MeasureGroupIdentifier],
            [attributeLocalId(ReferenceLdm.Product.Name)],
        );

        expect(wrapper.find(CoreBulletChart)).toHaveLength(1);
        expect(wrapper.find(CoreBulletChart).prop("execution")).toBeDefined();

        const definition = wrapper.find(CoreBulletChart).prop("execution").definition;

        expect(definition.dimensions).toEqual(exceptedDimensions);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = mount(
                <BulletChart
                    workspace="foo"
                    backend={dummyBackend()}
                    primaryMeasure={ReferenceLdm.Won}
                    config={config}
                />,
            );
            expect(wrapper.find(CoreBulletChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = mount(
                <BulletChart
                    workspace="foo"
                    backend={dummyBackend()}
                    primaryMeasure={ReferenceLdmExt.AmountWithRatio}
                    config={config}
                />,
            );
            expect(wrapper.find(CoreBulletChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });
    });
});
