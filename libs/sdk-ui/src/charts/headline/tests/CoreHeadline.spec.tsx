// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { CoreHeadline } from "../CoreHeadline";
import HeadlineTransformation from "../internal/HeadlineTransformation";
import { ICoreChartProps } from "../../chartProps";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { MasterIndex } from "../../../../__mocks__/recordings/playlist";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { headlineWithOneMeasure, headlineWithTwoMeasures } from "../../../../__mocks__/fixtures";

describe("Headline", () => {
    function createComponent(props: ICoreChartProps) {
        return mount<Partial<ICoreChartProps>>(
            <CoreHeadline {...props} afterRender={jest.fn()} drillableItems={[]} />,
        );
    }

    const backend = recordedBackend(MasterIndex);
    const singleMeasureExec = prepareExecution(backend, headlineWithOneMeasure.definition);
    const twoMeasureExec = prepareExecution(backend, headlineWithTwoMeasures.definition);

    describe("one measure", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            const drillEventCallback = jest.fn();
            const wrapper = createComponent({
                execution: singleMeasureExec,
                onDrill: drillEventCallback,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const renderedHeadlineTrans = wrapper.find(HeadlineTransformation);
                const wrapperProps = wrapper.props();
                expect(renderedHeadlineTrans.props()).toMatchObject({
                    dataView: {
                        definition: singleMeasureExec.definition,
                    },
                    onAfterRender: wrapperProps.afterRender,
                    drillableItems: wrapperProps.drillableItems,
                    onDrill: drillEventCallback,
                });
            });
        });
    });

    describe("two measures", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            const wrapper = createComponent({
                execution: twoMeasureExec,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const renderedHeadlineTrans = wrapper.find(HeadlineTransformation);
                const wrapperProps = wrapper.props();
                expect(renderedHeadlineTrans.props()).toMatchObject({
                    dataView: {
                        definition: twoMeasureExec.definition,
                    },
                    onAfterRender: wrapperProps.afterRender,
                    drillableItems: wrapperProps.drillableItems,
                });
            });
        });
    });
});
