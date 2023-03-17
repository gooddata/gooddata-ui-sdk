// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { testUtils } from "@gooddata/util";
import { CoreHeadline } from "../CoreHeadline";
import HeadlineTransformation from "../internal/HeadlineTransformation";
import { ICoreChartProps } from "../../../interfaces/chartProps";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../__mocks__/recordings";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../internal/HeadlineTransformation", () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

describe("CoreHeadline", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const afterRender = jest.fn();

    function createComponent(props: ICoreChartProps) {
        return render(<CoreHeadline {...props} afterRender={afterRender} drillableItems={[]} />);
    }

    const singleMeasureHeadline = recordedDataFacade(ReferenceRecordings.Scenarios.Headline.SingleMeasure);
    const twoMeasureHeadline = recordedDataFacade(ReferenceRecordings.Scenarios.Headline.SingleMeasure);

    const singleMeasureExec = singleMeasureHeadline.result().transform();
    const twoMeasureExec = twoMeasureHeadline.result().transform();

    describe("one measure", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            const drillEventCallback = jest.fn();
            createComponent({
                execution: singleMeasureExec,
                onDrill: drillEventCallback,
            });

            return testUtils.delay().then(() => {
                expect(HeadlineTransformation).toHaveBeenCalledWith(
                    expect.objectContaining({
                        dataView: expect.objectContaining({
                            definition: singleMeasureExec.definition,
                        }),
                        onAfterRender: afterRender,
                        drillableItems: [],
                        onDrill: drillEventCallback,
                    }),
                    {},
                );
            });
        });
    });

    describe("two measures", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            createComponent({
                execution: twoMeasureExec,
            });

            return testUtils.delay().then(() => {
                expect(HeadlineTransformation).toHaveBeenCalledWith(
                    expect.objectContaining({
                        dataView: expect.objectContaining({
                            definition: singleMeasureExec.definition,
                        }),
                        onAfterRender: afterRender,
                        drillableItems: [],
                    }),
                    {},
                );
            });
        });
    });
});
