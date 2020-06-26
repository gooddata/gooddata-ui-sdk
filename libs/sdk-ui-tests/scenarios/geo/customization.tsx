// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../src";
import { GeoPushpinChart, IGeoConfig, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import { LocationSegmentSizeAndColorWithTooltip } from "./base";
import { ScenarioGroupNames } from "../charts/_infra/groupNames";

function mergeConfig(props: IGeoPushpinChartProps, extraConfig: Partial<IGeoConfig>): IGeoPushpinChartProps {
    const defaultConfig = props.config!;

    return {
        ...props,
        config: {
            ...defaultConfig,
            ...extraConfig,
        },
    };
}

export default scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withDefaultWorkspaceType("live-examples-workspace")
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultTestTypes("api")
    .addScenario(
        "legend on the left",
        mergeConfig(LocationSegmentSizeAndColorWithTooltip, {
            legend: {
                enabled: false,
                position: "left",
            },
        }),
    )
    .addScenario(
        "legend on the right",
        mergeConfig(LocationSegmentSizeAndColorWithTooltip, {
            legend: {
                enabled: true,
                position: "right",
            },
        }),
    );
