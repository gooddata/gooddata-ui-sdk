// (C) 2007-2019 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import identity from "lodash/identity";
import cloneDeep from "lodash/cloneDeep";

import { ChartTransformation } from "../../src/highcharts";
import { VIEW_BY_DIMENSION_INDEX } from "../../src/highcharts/constants/dimensions";
import { BASE_DUAL_AXIS_CHARTS } from "../data/dualAxis";

import * as fixtures from "../test_data/fixtures";

import { wrap } from "../utils/wrap";

import "../../../sdk-ui-charts/styles/scss/charts.scss";

storiesOf("Internal/HighCharts/ChartProperties", module)
    .add("Dual axes chart, both axes with % format", () => {
        const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);

        const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
        measureItems.forEach((item: any) => {
            item.measureHeaderItem.format += "%";
        });

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart, right Y axis with % format", () => {
        const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);

        const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
        measureItems[2].measureHeaderItem.format += "%";

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    });
