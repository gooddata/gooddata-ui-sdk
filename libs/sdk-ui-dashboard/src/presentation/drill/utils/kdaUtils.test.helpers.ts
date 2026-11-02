// (C) 2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IKeyDriveAnalysis,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    newAttribute,
    newBucket,
    newDefForBuckets,
    newMeasure,
} from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";

const widthDescriptor: IMeasureDescriptor = {
    measureHeaderItem: { localIdentifier: "width", name: "Sum of Days to Close", format: "#,##0" },
};
const heightDescriptor: IMeasureDescriptor = {
    measureHeaderItem: { localIdentifier: "height", name: "Sum of Probability", format: "#,##0.0" },
};

function attributeDescriptor(localIdentifier: string, granularity?: string): IAttributeDescriptor {
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

const yearDescriptor = attributeDescriptor("year", "YEAR");
const stackDescriptor = attributeDescriptor("stack");

function attributeItem(name: string): IResultAttributeHeader {
    return { attributeHeaderItem: { uri: name, name, formattedName: name } };
}

const years = ["2011", "2012", "2013"].map(attributeItem);
const stackItem = attributeItem("East");

const widthValues = [894271, 1532324, 1600000];
const heightValues = [87277.8, 14086.3, 20000];

const measureGroup = { measureGroupHeader: { items: [widthDescriptor, heightDescriptor] } };
const measureItems = [0, 1].map((order) => ({ measureHeaderItem: { name: "", order } }));

export const keyDriverAnalysis: IKeyDriveAnalysis = {
    type: "keyDriveAnalysis",
    transition: "in-place",
    origin: { type: "drillFromMeasure", measure: { localIdentifier: "height" } },
};

const widthMeasure = newMeasure("days", (m) => m.localId("width"));
const heightMeasure = newMeasure("probability", (m) => m.localId("height"));
const yearAttribute = newAttribute("year", (a) => a.localId("year"));
const stackAttribute = newAttribute("stack", (a) => a.localId("stack"));

function createDataView(stacked: boolean): IDataView {
    const definition = newDefForBuckets("workspace", [
        newBucket("measures", widthMeasure),
        newBucket("secondary_measures", heightMeasure),
        newBucket("view", yearAttribute),
        ...(stacked ? [newBucket("stack", stackAttribute)] : []),
    ]);

    if (stacked) {
        return {
            definition,
            result: {
                dimensions: [{ headers: [stackDescriptor] }, { headers: [yearDescriptor, measureGroup] }],
            },
            headerItems: [
                [[stackItem]],
                [years.flatMap((year) => [year, year]), years.flatMap(() => measureItems)],
            ],
            data: [widthValues.flatMap((width, index) => [width, heightValues[index]])],
            offset: [0, 0],
            count: [1, 6],
            totalCount: [1, 6],
        } as unknown as IDataView;
    }

    return {
        definition,
        result: { dimensions: [{ headers: [measureGroup] }, { headers: [yearDescriptor] }] },
        headerItems: [[measureItems], [years]],
        data: [widthValues, heightValues],
        offset: [0, 0],
        count: [2, 3],
        totalCount: [2, 3],
    } as unknown as IDataView;
}

export function createDrillEvent(stacked: boolean, yearIndex: number): IDrillEvent {
    return {
        type: "mekko",
        dataView: createDataView(stacked),
        drillContext: {
            type: "mekko",
            element: "point",
            intersection: [
                { header: widthDescriptor },
                { header: heightDescriptor },
                { header: { ...years[yearIndex], ...yearDescriptor } },
                ...(stacked ? [{ header: { ...stackItem, ...stackDescriptor } }] : []),
            ],
        },
    } as unknown as IDrillEvent;
}
