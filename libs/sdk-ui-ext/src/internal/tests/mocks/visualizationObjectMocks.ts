// (C) 2019 GoodData Corporation
import { IAttribute, IBucket, IMeasure } from "@gooddata/sdk-model";

export const measureItemM1: IMeasure = {
    measure: {
        localIdentifier: "m1",
        definition: {
            measureDefinition: {
                item: {
                    uri: "/gdc/md/project/obj/1279",
                },
            },
        },
    },
};

export const attributeItemA1: IAttribute = {
    attribute: {
        localIdentifier: "a1",
        displayForm: {
            uri: "/gdc/md/project/obj/1027",
        },
    },
};

export const attributeItemA2: IAttribute = {
    attribute: {
        localIdentifier: "a1",
        displayForm: {
            uri: "/gdc/md/project/obj/1027",
        },
    },
};

export const oneMeasureOneView: IBucket[] = [
    {
        localIdentifier: "measures",
        items: [measureItemM1],
    },
    {
        localIdentifier: "view",
        items: [attributeItemA1],
    },
];

export const oneMeasureOneStack: IBucket[] = [
    {
        localIdentifier: "measures",
        items: [measureItemM1],
    },
    {
        localIdentifier: "stack",
        items: [attributeItemA1],
    },
];
