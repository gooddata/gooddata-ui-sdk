// (C) 2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IInsight,
    type IMeasureDescriptor,
    newAttribute,
    newBucket,
    newDefForBuckets,
    newMeasure,
} from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";

export const measure = newMeasure("revenue", (m) => m.localId("revenue").alias("Revenue"));
export const measureDescriptor: IMeasureDescriptor = {
    measureHeaderItem: { localIdentifier: "revenue", name: "Revenue", format: "#,##0" },
};

export function attributeDescriptor(localIdentifier: string, granularity?: string): IAttributeDescriptor {
    return {
        attributeHeader: {
            localIdentifier,
            name: localIdentifier,
            uri: `/${localIdentifier}`,
            identifier: localIdentifier,
            ref: { identifier: localIdentifier, type: "displayForm" },
            primaryLabel: { identifier: localIdentifier, type: "displayForm" },
            formOf: {
                name: localIdentifier,
                uri: `/${localIdentifier}`,
                identifier: localIdentifier,
                ref: { identifier: localIdentifier, type: "attribute" },
            },
            granularity,
        },
    };
}

export function createDrillEvent(index = 1, granularity = "YEAR"): IDrillEvent {
    const dateDescriptor = attributeDescriptor("date", granularity);
    const dateValues =
        granularity === "SECOND"
            ? ["2024-01-01T00:00:00", "2024-01-01T00:00:01", "2024-01-01T00:00:02"]
            : ["2023", "2024", "2025"];
    const dates = dateValues.map((year) => ({
        attributeHeaderItem: {
            uri: year,
            name: year,
            formattedName: year,
            normalizedValue: granularity === "SECOND" ? year : `${year}-01-01`,
        },
    }));
    const definition = newDefForBuckets("workspace", [
        newBucket("measures", measure),
        newBucket(
            "view",
            newAttribute("date", (a) => a.localId("date")),
        ),
    ]);
    const dataView = {
        definition,
        result: {
            dimensions: [
                { headers: [{ measureGroupHeader: { items: [measureDescriptor] } }] },
                { headers: [dateDescriptor] },
            ],
        },
        headerItems: [[[{ measureHeaderItem: { name: "Revenue", order: 0 } }]], [dates]],
        data: [[10, 20, 15]],
        offset: [0, 0],
        count: [1, 3],
        totalCount: [1, 3],
    } as unknown as IDataView;

    return {
        type: "column",
        dataView,
        drillContext: {
            type: "column",
            element: "point",
            intersection: [{ header: measureDescriptor }, { header: { ...dateDescriptor, ...dates[index] } }],
        },
    } as IDrillEvent;
}

export const insight: IInsight = {
    insight: {
        visualizationUrl: "local:column",
        ref: { identifier: "revenue-chart", type: "insight" },
        identifier: "revenue-chart",
        uri: "/revenue-chart",
        title: "Revenue",
        created: "2026-01-01",
        updated: "2026-01-01",
        tags: [],
        isLocked: false,
        filters: [],
        sorts: [],
        buckets: [
            newBucket("measures", measure),
            newBucket(
                "view",
                newAttribute("date", (a) => a.localId("date")),
            ),
        ],
        properties: {},
    },
};
