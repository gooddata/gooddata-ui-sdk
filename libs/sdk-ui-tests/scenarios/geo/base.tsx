// (C) 2007-2019 GoodData Corporation
import { ExamplesLdm, ExamplesLdmExt } from "@gooddata/live-examples-workspace";
import { GeoPushpinChart, IGeoConfig, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import { MapboxToken, scenariosFor } from "../../src";
import { IAttribute, modifyAttribute, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const DefaultConfig: IGeoConfig = {
    mapboxToken: MapboxToken,
};

/*
 * Note the explicitly hardcoded local identifier. This is here for very intricate reasons related to constructing
 * insights for GeoPushpin scenarios.
 *
 * See chartConfigToProperties.ts for more.
 */
const tooltipDisplayForm: IAttribute = modifyAttribute(ExamplesLdm.City.Default, (m) =>
    m.localId("tooltipText_df"),
);

export const LocationSegmentSizeAndColorWithTooltip: IGeoPushpinChartProps = {
    location: ExamplesLdm.City.Location,
    segmentBy: ExamplesLdm.StateName,
    size: ExamplesLdmExt.sizeMeasure,
    color: ExamplesLdmExt.colorMeasure,
    config: {
        ...DefaultConfig,
        tooltipText: tooltipDisplayForm,
    },
};

export default scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withDefaultWorkspaceType("live-examples-workspace")
    .withDefaultTestTypes("api")

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
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location and size  with tooltip", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location and color with tooltip", {
        location: ExamplesLdm.City.Location,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, size and color with tooltip", {
        location: ExamplesLdm.City.Location,
        size: ExamplesLdmExt.sizeMeasure,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
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
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, size with tooltip", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        size: ExamplesLdmExt.sizeMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, color with tooltip", {
        location: ExamplesLdm.City.Location,
        segmentBy: ExamplesLdm.StateName,
        color: ExamplesLdmExt.colorMeasure,
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    })
    .addScenario("location, segment, size and color with tooltip", LocationSegmentSizeAndColorWithTooltip)
    .addScenario("location, segment, size and color with tooltip and filter", {
        ...LocationSegmentSizeAndColorWithTooltip,
        filters: [newPositiveAttributeFilter(ExamplesLdm.StateName, ["California", "Florida", "Texas"])],
    });
