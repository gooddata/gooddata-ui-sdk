// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { Visualization, oneMeasureDataSource } from "../../../tests/mocks";
import { BaseChart, IBaseChartProps } from "../BaseChart";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

describe("BaseChart", () => {
    const createProps = (customProps = {}) => {
        const props: IBaseChartProps = {
            height: 200,
            dataSource: oneMeasureDataSource,
            locale: "en-US",
            type: VisualizationTypes.LINE,
            visualizationComponent: Visualization,
            afterRender: jest.fn(),
            updateTotals: jest.fn(),
            drillableItems: [],
            resultSpec: {},
            config: { colors: ["shiny"] },
            onFiredDrillEvent: jest.fn(),
            ...customProps,
        };
        return props;
    };

    function createComponent(props: IBaseChartProps) {
        return mount(<BaseChart {...props} />);
    }

    it("should render given visualization component", () => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged,
        });
        const wrapper = createComponent(props);

        return testUtils.delay().then(() => {
            wrapper.update();
            const visualization = wrapper.find(Visualization);

            expect(visualization.length).toBe(1);
            expect(visualization.props()).toMatchObject({
                executionRequest: {
                    afm: props.dataSource.getAfm(),
                    resultSpec: props.resultSpec,
                },
                executionResponse: expect.any(Object),
                executionResult: expect.any(Object),
                afterRender: props.afterRender,
                drillableItems: props.drillableItems,

                height: props.height,
                config: { ...props.config, type: props.type },
                onFiredDrillEvent: props.onFiredDrillEvent,
                numericSymbols: expect.any(Object),
            });
        });
    });

    it('should pass "onLegendReady" to visualization', () => {
        const onLegendReady = jest.fn();

        const props = createProps({
            onLegendReady,
        });

        const wrapper = createComponent(props);
        return testUtils.delay().then(() => {
            wrapper.update();

            expect(wrapper.find(Visualization).prop("onLegendReady")).toEqual(onLegendReady);
        });
    });
});
