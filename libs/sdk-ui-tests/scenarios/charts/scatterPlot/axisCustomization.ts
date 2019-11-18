// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";

export default scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...ScatterPlotWithMeasuresAndAttribute,
        config: {
            yaxis: {
                min: "0.5",
                max: "0.55",
            },
            xaxis: {
                min: "5000000",
                max: "15000000",
            },
        },
    });
