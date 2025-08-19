// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { MeasureGroupIdentifier, newAttributeSort, newTwoDimensional } from "@gooddata/sdk-model";

import { BulletChart } from "../BulletChart.js";
import { CoreBulletChart } from "../CoreBulletChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreBulletChart", () => ({
    CoreBulletChart: vi.fn(() => null),
}));

describe("BulletChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render bullet chart and create correct stacking dimensions", () => {
        // note: this test was previously verifying that AFM is created correctly; that is pointless now as the
        //  transformation is tested elsewhere. the important thing to test is that dimensions are built as expected.
        render(
            <BulletChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasure={ReferenceMd.Won}
                viewBy={[ReferenceMd.Product.Name]}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );
        const expectedDimensions = newTwoDimensional([MeasureGroupIdentifier], [ReferenceMd.Product.Name]);

        expect(CoreBulletChart).toHaveBeenCalledWith(
            expect.objectContaining({
                execution: expect.objectContaining({
                    definition: expect.objectContaining({
                        dimensions: expectedDimensions,
                    }),
                }),
            }),
            expect.anything(),
        );
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should reset stackMeasuresToPercent in case of one measure", () => {
            render(
                <BulletChart
                    workspace="foo"
                    backend={dummyBackend()}
                    primaryMeasure={ReferenceMd.Won}
                    config={config}
                />,
            );
            expect(CoreBulletChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                }),
                expect.anything(),
            );
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            render(
                <BulletChart
                    workspace="foo"
                    backend={dummyBackend()}
                    primaryMeasure={ReferenceMdExt.AmountWithRatio}
                    config={config}
                />,
            );
            expect(CoreBulletChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                }),
                expect.anything(),
            );
        });
    });
});
