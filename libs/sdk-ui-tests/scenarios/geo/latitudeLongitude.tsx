// (C) 2023 GoodData Corporation
import { ExamplesMd } from "@gooddata/live-examples-workspace";
import { GeoPushpinChart, IGeoConfig, IGeoPushpinChartLatitudeLongitudeProps } from "@gooddata/sdk-ui-geo";
import { MapboxToken, scenariosFor } from "../../src/index.js";
import { IAttribute, modifyAttribute } from "@gooddata/sdk-model";
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

export default scenariosFor<IGeoPushpinChartLatitudeLongitudeProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withDefaultWorkspaceType("live-examples-workspace")
    .withDefaultTestTypes("api")
    .addScenario("latitude and longitude only with tooltip", {
        // This workaround is using the same lat;long value twice, for latitude and longitude props.
        // In both cases only first number is parsed and used as single numeric coordinate
        // It is because such attr labels are now missing in WS used for test, see ticket RAIL-4780
        latitude: ExamplesMd.City.Location,
        longitude: modifyAttribute(ExamplesMd.City.Location, (a) => a.localId("longitude_df")),
        config: {
            ...DefaultConfig,
            tooltipText: tooltipDisplayForm,
        },
    });
