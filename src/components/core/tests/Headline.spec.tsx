// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { oneMeasureOneDimensionDataSource, twoMeasuresOneDimensionDataSource } from "../../tests/mocks";
import { Headline } from "../Headline";
import { ICommonVisualizationProps } from "../base/VisualizationLoadingHOC";
import HeadlineTransformation from "../../visualizations/headline/HeadlineTransformation";
import { IDataSourceProviderInjectedProps } from "../../afm/DataSourceProvider";

describe("Headline", () => {
    function createComponent(props: ICommonVisualizationProps & IDataSourceProviderInjectedProps) {
        return mount<Partial<ICommonVisualizationProps & IDataSourceProviderInjectedProps>>(
            <Headline
                {...props}
                afterRender={jest.fn()}
                drillableItems={[]}
                resultSpec={{
                    dimensions: [{ itemIdentifiers: ["measureGroup"] }],
                }}
            />,
        );
    }

    describe("one measure", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            const drillEventCallback = jest.fn();
            const wrapper = createComponent({
                dataSource: oneMeasureOneDimensionDataSource,
                onFiredDrillEvent: drillEventCallback,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const renderedHeadlineTrans = wrapper.find(HeadlineTransformation);
                const wrapperProps = wrapper.props();
                expect(renderedHeadlineTrans.props()).toMatchObject({
                    executionRequest: {
                        afm: wrapperProps.dataSource.getAfm(),
                        resultSpec: wrapperProps.resultSpec,
                    },
                    executionResponse: expect.any(Object),
                    executionResult: expect.any(Object),
                    onAfterRender: wrapperProps.afterRender,
                    drillableItems: wrapperProps.drillableItems,
                    onFiredDrillEvent: drillEventCallback,
                });
            });
        });
    });

    describe("two measures", () => {
        it("should render HeadlineTransformation and pass down given props and props from execution", () => {
            const wrapper = createComponent({
                dataSource: twoMeasuresOneDimensionDataSource,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                const renderedHeadlineTrans = wrapper.find(HeadlineTransformation);
                const wrapperProps = wrapper.props();
                expect(renderedHeadlineTrans.props()).toMatchObject({
                    executionRequest: {
                        afm: wrapperProps.dataSource.getAfm(),
                        resultSpec: wrapperProps.resultSpec,
                    },
                    executionResponse: expect.any(Object),
                    executionResult: expect.any(Object),
                    onAfterRender: wrapperProps.afterRender,
                    drillableItems: wrapperProps.drillableItems,
                });
            });
        });
    });
});
