// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MEASURES, METRIC, SECONDARY_MEASURES, VIEW } from "../../constants/bucket.js";
import { AREA_CHART_TYPE, COLUMN_CHART_TYPE, LINE_CHART_TYPE } from "../../constants/measure_chart_types.js";
import { LOCAL_COMBO2 } from "../../constants/visualization_types.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { initialState } from "../../reducers/initial_state.js";
import { type IAppState } from "../../store/types.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import {
    type IMeasureConfigurationProps,
    MeasureConfigurationBase,
    MeasureConfigurationTest,
} from "./MeasureConfiguration.js";

describe("MeasureConfiguration", () => {
    describe("component", () => {
        function renderComponent(customProps = {}) {
            const props: IMeasureConfigurationProps = {
                canSelectChartType: false,
                localIdentifier: MEASURES,
                isDualAxisEnabled: false,
                isSecondaryAxisCheckboxVisible: false,
                selectedChartType: LINE_CHART_TYPE,
                supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
                isOptionalStackingSupported: true,
                toggleDualAxis: () => {},
                changeMeasureChartType: () => {},
                ...customProps,
            };

            const Wrapped = withIntl(withRedux(MeasureConfigurationBase));
            return render(<Wrapped {...props} />);
        }

        it("should NOT render measure configuration component", () => {
            const { container } = renderComponent();
            expect(container.querySelectorAll(".s-measure-configuration-measures")).toHaveLength(0);
        });

        it("should render measures configuration component", () => {
            const { container } = renderComponent({
                canSelectChartType: true,
                localIdentifier: MEASURES,
            });

            expect(container.querySelectorAll(".s-measure-configuration-measures")).toHaveLength(1);
        });

        it("should render secondary measure configuration component", () => {
            const { container } = renderComponent({
                canSelectChartType: true,
                localIdentifier: SECONDARY_MEASURES,
            });

            expect(container.querySelectorAll(".s-measure-configuration-secondary_measures")).toHaveLength(1);
        });

        it("should render measure configuration component with measure configuration body", () => {
            const { container } = renderComponent({
                canSelectChartType: true,
            });

            expect(document.querySelectorAll(".s-measure-configuration-measures")).toHaveLength(1);

            fireEvent.click(container.querySelector(".s-measure-configuration-measures"));

            expect(document.querySelectorAll(".s-measure-configuration-body")).toHaveLength(1);
        });

        it("should open/close measure configuration dialog", () => {
            const { container } = renderComponent({
                canSelectChartType: true,
            });

            expect(container.querySelectorAll(".s-measure-configuration-measures")).toHaveLength(1);

            const measureConfiguration = container.querySelector(".s-measure-configuration-measures");

            fireEvent.click(measureConfiguration);
            expect(document.querySelector(".s-measure-configuration-body")).toBeInTheDocument();

            fireEvent.click(measureConfiguration);

            expect(document.querySelector(".s-measure-configuration-body")).not.toBeInTheDocument();
        });
    });

    describe("selector", () => {
        const defaultProps = {
            localIdentifier: MEASURES,
        };
        const props = {
            localIdentifier: SECONDARY_MEASURES,
        };
        const chartTypes = [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE];
        const state = withData(initialState, {
            // PRE-EXISTING: the visualization class fixture is the OLD `{ content, meta }` shape, not
            // the `{ visualizationClass }` one the loader stores. Preserved verbatim, hence the cast.
            visualizationClass: {
                content: { url: LOCAL_COMBO2 },
                meta: {
                    uri: "visualizationClassUri",
                    title: "Combo chart",
                },
            } as unknown as IAppState["data"]["visualizationClass"],
            buckets: [
                {
                    localIdentifier: MEASURES,
                    chartType: COLUMN_CHART_TYPE,
                    items: [
                        {
                            attribute: "test",
                            showOnSecondaryAxis: false,
                            filters: [],
                            type: METRIC,
                        },
                        {
                            attribute: "test 1",
                            showOnSecondaryAxis: false,
                            filters: [],
                            type: METRIC,
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    chartType: LINE_CHART_TYPE,
                    items: [
                        {
                            attribute: "test",
                            showOnSecondaryAxis: true,
                            filters: [],
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            attribute: DATE_DATASET_ATTRIBUTE,
                            filters: [],
                        },
                    ],
                },
            ],
            extendedReferencePoint: {
                uiConfig: {
                    buckets: {
                        measures: {
                            allowSelectChartType: true,
                            allowOptionalStacking: true,
                        },
                        secondary_measures: {
                            allowSelectChartType: true,
                            allowShowOnSecondaryAxis: true,
                        },
                    },
                    supportedChartTypes: chartTypes,
                    optionalStacking: {
                        supported: true,
                    },
                },
            } as unknown as IAppState["data"]["extendedReferencePoint"],
        });

        it("should return column, line, area chart types on both measures", () => {
            const selectorResult = MeasureConfigurationTest.getSupportedChartTypes(state);
            expect(selectorResult).toEqual(chartTypes);
        });

        it("should allow select chart type on both measures", () => {
            const measureSelectorResult = MeasureConfigurationTest.getAllowSelectChartType(
                state,
                defaultProps,
            );
            expect(measureSelectorResult).toEqual(true);

            const secondaryMeasureSelectorResult = MeasureConfigurationTest.getAllowSelectChartType(
                state,
                props,
            );
            expect(secondaryMeasureSelectorResult).toEqual(true);
        });

        it("should allow optional stacking on primary measure", () => {
            const measureSelectorResult = MeasureConfigurationTest.isOptionalStackingVisible(
                state,
                defaultProps,
            );
            expect(measureSelectorResult).toEqual(true);
        });

        it("should not allow optional stacking on secondary measure", () => {
            const secondaryMeasureSelectorResult = MeasureConfigurationTest.isOptionalStackingVisible(
                state,
                props,
            );
            expect(secondaryMeasureSelectorResult).toEqual(false);
        });

        describe("Secondary axis checkbox", () => {
            it("should not be visible on primary measure", () => {
                const measureSelectorResult = MeasureConfigurationTest.getAllowShowOnSecondaryAxis(
                    state,
                    defaultProps,
                );
                expect(measureSelectorResult).toEqual(false);
            });

            it("should be visible on secondary measure", () => {
                const secondaryMeasureSelectorResult = MeasureConfigurationTest.getAllowShowOnSecondaryAxis(
                    state,
                    props,
                );
                expect(secondaryMeasureSelectorResult).toEqual(true);
            });
        });

        describe("Dual axis", () => {
            it("should return true by default", () => {
                const measureSelectorResult = MeasureConfigurationTest.getDualAxisEnabled(state);
                expect(measureSelectorResult).toEqual(true);
            });

            it("should return false when dual axis is disabled", () => {
                const mockState = withData(state, {
                    visualizationProperties: {
                        ...state.data.visualizationProperties,
                        controls: { ...state.data.visualizationProperties?.controls, dualAxis: false },
                    },
                });
                const secondaryMeasureSelectorResult = MeasureConfigurationTest.getDualAxisEnabled(mockState);
                expect(secondaryMeasureSelectorResult).toEqual(false);
            });
        });

        describe("Selected chart type", () => {
            it("should return column by default on primary measure", () => {
                const measureSelectorResult = MeasureConfigurationTest.getSelectedChartType(
                    state,
                    defaultProps,
                );
                expect(measureSelectorResult).toEqual(COLUMN_CHART_TYPE);
            });

            it("should return line by default on secondary measure", () => {
                const secondaryMeasureSelectorResult = MeasureConfigurationTest.getSelectedChartType(
                    state,
                    props,
                );
                expect(secondaryMeasureSelectorResult).toEqual(LINE_CHART_TYPE);
            });
        });
    });
});
