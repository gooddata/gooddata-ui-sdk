// (C) 2020 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";
import { ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ExamplesRecordings } from "@gooddata/live-examples-workspace";
import { getGeoData } from "../src/core/geoChart/helpers/geoChart/data.js";
import cloneDeep from "lodash/cloneDeep.js";
export function recordedDataFacade(rec: ScenarioRecording): DataViewFacade {
    return DataViewFacade.for(recordedDataView(rec));
}

function createShortcut(rec: ScenarioRecording) {
    const dv = recordedDataFacade(rec);

    return {
        dv,
        geoData: getGeoData(dv, "empty value", "null value"),
    };
}

function trimmedScenario(rec: ScenarioRecording, to: number[]) {
    const copy = cloneDeep(recordedDataView(rec));

    to.forEach((trim, dim) => {
        if (trim < 0) {
            return;
        }

        const headers = copy.headerItems[dim];

        if (headers) {
            for (let i = 0; i < headers.length; i++) {
                headers[i] = headers[i].slice(0, trim);
            }
        }

        if (dim === 0) {
            // @ts-ignore
            copy.data = copy.data.slice(0, trim) as any;
        } else if (dim === 1) {
            for (let i = 0; i < copy.data.length; i++) {
                const row = copy.data[i];

                if (Array.isArray(row)) {
                    copy.data[i] = row.slice(0, trim);
                }
            }
        }

        if (copy.count[dim]) {
            copy.count[dim] = trim;
        }

        if (copy.totalCount[dim]) {
            copy.totalCount[dim] = trim;
        }
    });

    const dv = DataViewFacade.for(copy);

    return {
        dv,
        geoData: getGeoData(dv, "empty value", "null value"),
    };
}

export const RecShortcuts = {
    LocationOnly: createShortcut(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationOnly),
    LocationOnlySmall: trimmedScenario(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationOnly, [10]),
    LocationAndSize: createShortcut(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationAndSize),
    LocationAndColor: createShortcut(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationAndColor),
    LocationAndColor_Small: trimmedScenario(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationAndColor,
        [-1, 10],
    ),
    LocationSizeAndTooltip: createShortcut(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationAndSizeWithTooltip,
    ),
    LocationSizeAndTooltip_Small: trimmedScenario(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationAndSizeWithTooltip,
        [-1, 10],
    ),
    LocationSizeAndColor: createShortcut(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSizeAndColor),
    LocationSizeAndColor_Small: trimmedScenario(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSizeAndColor,
        [-1, 10],
    ),
    LocationSegmentAndColor: createShortcut(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSegmentAndColor,
    ),
    LocationSegmentAndColor_Small: trimmedScenario(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSegmentAndColor,
        [-1, 10],
    ),
    LocationSegmentAndSize: createShortcut(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSegmentAndSize,
    ),
    All: createShortcut(ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSegmentSizeAndColorWithTooltip),
    AllAndSmall: createShortcut(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LocationSegmentSizeAndColorWithTooltipAndFilter,
    ),
    LatitudeAndLongitudeOnlyWithTooltip: createShortcut(
        ExamplesRecordings.Scenarios.GeoPushpinChart.LatitudeAndLongitudeOnlyWithTooltip,
    ),
};
