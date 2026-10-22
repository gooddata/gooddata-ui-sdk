// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IResultAttributeHeader,
    idRef,
    newAttribute,
    newBucket,
    newDefForBuckets,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";

import { transformPushpinData } from "./transformation.js";

const BUCKETS = [BucketNames.LATITUDE, BucketNames.LONGITUDE, BucketNames.GEO_ICON] as const;

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

function item(name: string, formattedName: string): IResultAttributeHeader {
    return { attributeHeaderItem: { uri: name, name, formattedName } };
}

// one row per element: latitude, longitude and geo icon items
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

describe("transformPushpinData of number-formatted attribute values", () => {
    // a number format rounds the values and uses a decimal comma
    const dv = dataView([
        [item("50.0755381", "50,08"), item("14.4378005", "14,44"), item("1", "1,0")],
        [item("49.1950602", "49,2"), item("16.6068371", "16,61"), item("2", "2,0")],
    ]);

    it("parses coordinates from the raw values", () => {
        expect(transformPushpinData(dv, "(empty)", "(null)").location?.data).toEqual([
            { lat: 50.0755381, lng: 14.4378005 },
            { lat: 49.1950602, lng: 16.6068371 },
        ]);
    });

    it("reads icon names from the raw values", () => {
        expect(transformPushpinData(dv, "(empty)", "(null)").geoIcon?.data).toEqual(["1", "2"]);
    });
});
