// (C) 2007-2019 GoodData Corporation
import { ExamplesLdm, ExamplesLdmExt } from "@gooddata/examples-workspace";
import { GeoPushpinChart, IGeoConfig, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import { scenariosFor } from "../../src";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

const MapboxTokenEnvVariable = "STORYBOOK_MAPBOX_ACCESS_TOKEN";
const MapboxToken = process.env[MapboxTokenEnvVariable] ?? "this-is-not-real-token";

const DefaultConfig: IGeoConfig = {
    mapboxToken: MapboxToken,
};

export const LocationSegmentSizeAndColorWithTooltip: IGeoPushpinChartProps = {
    location: ExamplesLdm.City.Location,
    segmentBy: ExamplesLdm.StateName,
    size: ExamplesLdmExt.sizeMeasure,
    color: ExamplesLdmExt.colorMeasure,
    config: {
        ...DefaultConfig,
        tooltipText: ExamplesLdm.City.Default,
    },
};

export default scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withDefaultWorkspaceType("examples-workspace")

    //
    //
    //

    .addScenario("location only", {
        location: ExamplesLdm.City.Location,
        config: DefaultConfig,
    })
    .addScenario("location and size", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        config: DefaultConfig,
    })
    .addScenario("location and color", {
        location: ExamplesLdm.City.Location,
        color: ExamplesLdmExt.colorMeasure,
        config: DefaultConfig,
    })
    .addScenario("location, size and color", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        color: ExamplesLdmExt.colorMeasure,
        config: DefaultConfig,
    })

    //
    //
    //

    .addScenario("location only with tooltip", {
        location: ExamplesLdm.City.Location,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location and size  with tooltip", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location and color with tooltip", {
        location: ExamplesLdm.City.Location,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location, size and color with tooltip", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })

    //
    //
    //

    .addScenario("location and segment", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        config: DefaultConfig,
    })
    .addScenario("location, segment and size", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        size: ExamplesLdmExt.sizeMeasure,
        config: DefaultConfig,
    })
    .addScenario("location, segment and color", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        color: ExamplesLdmExt.colorMeasure,
        config: DefaultConfig,
    })

    .addScenario("location, segment, size and color ", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        size: ExamplesLdmExt.sizeMeasure,
        color: ExamplesLdmExt.colorMeasure,
        config: DefaultConfig,
    })
    //
    //
    //
    .addScenario("location and segment with tooltip", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location, segment, size with tooltip", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        size: ExamplesLdmExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location, segment, color with tooltip", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: ExamplesLdm.City.Default,
        },
    })
    .addScenario("location, segment, size and color with tooltip", LocationSegmentSizeAndColorWithTooltip)
    .addScenario("location, segment, size and color with tooltip and filter", {
        ...LocationSegmentSizeAndColorWithTooltip,
        filters: [newPositiveAttributeFilter(ExamplesLdm.StateName, ["California", "Florida", "Texas"])],
    });
