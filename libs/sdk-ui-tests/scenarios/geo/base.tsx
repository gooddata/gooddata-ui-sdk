// (C) 2007-2019 GoodData Corporation
import { ExamplesMd, ExamplesMdExt } from "@gooddata/live-examples-workspace";
import { GeoPushpinChart, IGeoConfig, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import { MapboxToken, scenariosFor } from "../../src/index.js";
import { IAttribute, modifyAttribute, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const DefaultConfig: IGeoConfig = {
    mapboxToken: MapboxToken,
    showLabels: false,
};

/*
 * Note the explicitly hardcoded local identifier. This is here for very intricate reasons related to constructing
 * insights for GeoPushpin scenarios.
 *
 * See chartConfigToProperties.ts for more.
 */
const tooltipDisplayForm: IAttribute = modifyAttribute(ExamplesMd.City.Default, (m) =>
    m.localId("tooltipText_df"),
);

export const LocationSegmentSizeAndColorWithTooltip: IGeoPushpinChartProps = {
    location: ExamplesMd.City.Location,
    segmentBy: ExamplesMd.StateName,
    size: ExamplesMdExt.sizeMeasure,
    color: ExamplesMdExt.colorMeasure,
    config: {
        ...DefaultConfig,
        tooltipText: tooltipDisplayForm,
    },
};

export default scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withDefaultWorkspaceType("live-examples-workspace")
    .withDefaultTestTypes("api")

    //
    //
    //

    .addScenario("location only", {
        location: ExamplesMd.City.Location,
        config: DefaultConfig,
    })
    .addScenario("location and size", {
        location: ExamplesMd.City.Location,
        size: ExamplesMdExt.sizeMeasure,
        config: DefaultConfig,
    })
    .addScenario("location and color", {
        location: ExamplesMd.City.Location,
        color: ExamplesMdExt.colorMeasure,
        config: DefaultConfig,
    })
    .addScenario("location, size and color", {
        location: ExamplesMd.City.Location,
        size: ExamplesMdExt.sizeMeasure,
        color: ExamplesMdExt.colorMeasure,
        config: DefaultConfig,
    })

    //
    //
    //

    .addScenario("location only with tooltip", {
        location: ExamplesMd.City.Location,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location and size  with tooltip", {
        location: ExamplesMd.City.Location,
        size: ExamplesMdExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location and color with tooltip", {
        location: ExamplesMd.City.Location,
        color: ExamplesMdExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, size and color with tooltip", {
        location: ExamplesMd.City.Location,
        size: ExamplesMdExt.sizeMeasure,
        color: ExamplesMdExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })

    //
    //
    //

    .addScenario("location and segment", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        config: DefaultConfig,
    })
    .addScenario("location, segment and size", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        size: ExamplesMdExt.sizeMeasure,
        config: DefaultConfig,
    })
    .addScenario("location, segment and color", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        color: ExamplesMdExt.colorMeasure,
        config: DefaultConfig,
    })

    .addScenario("location, segment, size and color ", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        size: ExamplesMdExt.sizeMeasure,
        color: ExamplesMdExt.colorMeasure,
        config: DefaultConfig,
    })
    //
    //
    //
    .addScenario("location and segment with tooltip", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, size with tooltip", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        size: ExamplesMdExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, color with tooltip", {
        location: ExamplesMd.City.Location,
        segmentBy: ExamplesMd.StateName,
        color: ExamplesMdExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, size and color with tooltip", LocationSegmentSizeAndColorWithTooltip)
    .addScenario("location, segment, size and color with tooltip and filter", {
        ...LocationSegmentSizeAndColorWithTooltip,
        filters: [newPositiveAttributeFilter(ExamplesMd.StateName, ["California", "Florida", "Texas"])],
    });
