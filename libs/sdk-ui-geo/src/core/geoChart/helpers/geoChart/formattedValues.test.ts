// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IResultAttributeHeader,
    idRef,
    newAttribute,
    newBucket,
    newDefForBuckets,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, type IDrillEvent } from "@gooddata/sdk-ui";

import { type IGeoDrillEvent } from "../../../../GeoChart.js";

import { getGeoData } from "./data.js";
import { handleGeoPushpinDrillEvent } from "./drilling.js";

const EMPTY = "(empty value)";
const NULL = "(null value)";

const BUCKETS = [
    BucketNames.LATITUDE,
    BucketNames.LONGITUDE,
    BucketNames.SEGMENT,
    BucketNames.TOOLTIP_TEXT,
] as const;

function descriptor(localId: string): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/uri/${localId}`,
            identifier: `${localId}.df`,
            localIdentifier: localId,
            ref: idRef(`${localId}.df`, "displayForm"),
            name: localId,
            formOf: {
                uri: `/uri/${localId}.attr`,
                identifier: `${localId}.attr`,
                name: localId,
                ref: idRef(`${localId}.attr`, "attribute"),
            },
            primaryLabel: idRef(`${localId}.df`, "displayForm"),
        },
    };
}

function item(name: string | null, formattedName?: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            uri: name as string,
            name: name as string,
            ...(formattedName === undefined ? {} : { formattedName }),
        },
    };
}

// one row per element: latitude, longitude, segment and tooltip text items
function dataView(rows: IResultAttributeHeader[][]): DataViewFacade {
    const definition = newDefForBuckets(
        "workspace",
        BUCKETS.map((bucket) =>
            newBucket(
                bucket,
                newAttribute(`${bucket}.df`, (a) => a.localId(bucket)),
            ),
        ),
    );
    const columns = BUCKETS.map((_, column) => rows.map((row) => row[column]));

    return DataViewFacade.for({
        definition,
        headerItems: [columns],
        data: [],
        offset: [0],
        count: [rows.length],
        totalCount: [rows.length],
        result: { dimensions: [{ headers: BUCKETS.map(descriptor) }] },
        metadata: {},
        forecast: () => ({ headerItems: [], data: [] }),
    } as unknown as IDataView);
}

const rows = [
    // a number format rounds the coordinates and uses a decimal comma
    [item("50.0755381", "50,08"), item("14.4378005", "14,44"), item("1000", "1 000"), item("7.5", "7,5")],
    [item("49.1950602", "49,2"), item("16.6068371", "16,61"), item(""), item(null)],
];

describe("legacy geo data of number-formatted attribute values", () => {
    it("parses coordinates from the raw values", () => {
        const geoData = getGeoData(dataView(rows), EMPTY, NULL);

        expect(geoData.location?.data).toEqual([
            { lat: 50.0755381, lng: 14.4378005 },
            { lat: 49.1950602, lng: 16.6068371 },
        ]);
    });

    it("shows the formatted values and keeps the raw element uris", () => {
        const geoData = getGeoData(dataView(rows), EMPTY, NULL);

        expect(geoData.segment?.data).toEqual(["1 000", ""]);
        expect(geoData.segment?.uris).toEqual(["1000", ""]);
        expect(geoData.tooltipText?.data).toEqual(["7,5", NULL]);
    });
});

describe("legacy geo drill event of number-formatted attribute values", () => {
    function drill(rowIndex: number): IGeoDrillEvent {
        const dv = dataView(rows);
        const geoData = getGeoData(dv, EMPTY, NULL);
        const onDrill = vi.fn<(event: IDrillEvent) => boolean>(() => false);
        // pin properties hold the values shown in the tooltip
        const pinProperties = {
            locationIndex: rowIndex,
            locationName: JSON.stringify({ value: geoData.tooltipText?.data[rowIndex] }),
            segment: JSON.stringify({ value: geoData.segment?.data[rowIndex] }),
            color: "{}",
            size: "{}",
        };

        handleGeoPushpinDrillEvent(
            [() => true],
            { dataView: dv.dataView, onDrill },
            dv,
            geoData,
            pinProperties,
            [0, 0],
            document.createElement("div"),
        );

        return onDrill.mock.calls[0][0].drillContext as IGeoDrillEvent;
    }

    it("carries the raw segment and location name values", () => {
        const event = drill(0);

        expect(event.segmentBy).toBe("1000");
        expect(event.locationName).toBe("7.5");
    });

    it("keeps the placeholders of empty and null values", () => {
        const event = drill(1);

        expect(event.segmentBy).toBe("");
        expect(event.locationName).toBe(NULL);
    });
});
