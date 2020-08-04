// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/utilities";
import { CoreHeadline } from "../CoreHeadline";
import HeadlineTransformation from "../internal/HeadlineTransformation";
import { ICoreChartProps } from "../../../interfaces/chartProps";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../__mocks__/recordings";

describe("Headline", () => {
    function createComponent(props: ICoreChartProps) {
        return mount<Partial<ICoreChartProps>>(
            <CoreHeadline {...props} afterRender={jest.fn()} drillableItems={[]} />,
        );
    }

    const singleMeasureHeadline = recordedDataFacade(ReferenceRecordings.Scenarios.Headline.SingleMeasure);
    const twoMeasureHeadline = recordedDataFacade(ReferenceRecordings.Scenarios.Headline.SingleMeasure);

    const singleMeasureExec = singleMeasureHeadline.result().transform();
    const twoMeasureExec = twoMeasureHeadline.result().transform();

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
