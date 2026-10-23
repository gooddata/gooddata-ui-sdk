// (C) 2021-2026 GoodData Corporation

import {
    type IElementsQueryOptions,
    type IElementsQueryOptionsElementsByValue,
} from "@gooddata/sdk-backend-spi";
import { tigerIdTypeToObjectType } from "@gooddata/sdk-backend-tiger";
import { type IAttributeElement, serializeObjRef } from "@gooddata/sdk-model";

import { docsIndex } from "../docs/index.js";
import {
    type ILabelElementsFuncResult,
    type ITigerMetadataObjectStub,
    type LabelElementsFunc,
    LdmObjects,
} from "../metadata/model.js";

export const ldmObjects: LdmObjects = new LdmObjects(
    [
        {
            type: "attribute",
            attribute: {
                type: "attribute",
                id: "3",
                title: "attribute title",
                description: "attribute description",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "attribute",
                    identifier: "3",
                },
                displayForms: [],
            },
            groups: [],
            displayForms: [
                {
                    attribute: {
                        type: "attribute",
                        identifier: "3",
                    },
                    type: "displayForm",
                    id: "4",
                    title: "label title",
                    description: "label description",
                    production: false,
                    deprecated: false,
                    unlisted: false,
                    uri: "",
                    ref: {
                        type: "displayForm",
                        identifier: "4",
                    },
                },
            ],
            defaultDisplayForm: {
                attribute: {
                    type: "attribute",
                    identifier: "3",
                },
                type: "displayForm",
                id: "4",
                title: "label title",
                description: "label description",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "displayForm",
                    identifier: "4",
                },
            },
            geoPinDisplayForms: [],
        },
    ],
    [
        {
            type: "fact",
            fact: {
                type: "fact",
                id: "1",
                title: "fact title",
                description: "fact description",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "fact",
                    identifier: "1",
                },
            },
            groups: [],
        },
        {
            type: "fact",
            fact: {
                type: "fact",
                id: "2",
                title: "fact 2 title",
                description: "fact to be sliced",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "fact",
                    identifier: "2",
                },
            },
            groups: [],
        },
    ],
    [
        {
            type: "measure",
            measure: {
                type: "measure",
                id: "2",
                title: "measure title",
                description: "measure description",
                expression: "SELECT SUM({fact/1})",
                format: "",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "measure",
                    identifier: "2",
                },
            },
            groups: [],
        },
    ],
    [
        {
            type: "parameter",
            id: "topN",
            title: "Top N",
            description: "Top N parameter",
            definition: {
                type: "NUMBER",
                defaultValue: 10,
            },
            production: false,
            deprecated: false,
            unlisted: false,
            uri: "",
            ref: {
                type: "parameter",
                identifier: "topN",
            },
        },
        {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            description: "Scenario parameter",
            definition: {
                type: "STRING",
                defaultValue: "actual",
                constraints: {
                    allowedValues: [
                        { value: "actual" },
                        { value: "budget", title: "Budget" },
                        { value: "forecast" },
                    ],
                },
            },
            production: false,
            deprecated: false,
            unlisted: false,
            uri: "",
            ref: {
                type: "parameter",
                identifier: "scenario",
            },
        },
        {
            type: "parameter",
            id: "freetext",
            title: "Free text",
            description: "Free text parameter",
            definition: {
                type: "STRING",
                defaultValue: "x",
            },
            production: false,
            deprecated: false,
            unlisted: false,
            uri: "",
            ref: {
                type: "parameter",
                identifier: "freetext",
            },
        },
    ],
    [
        {
            type: "dateDataset",
            relevance: 0,
            dataSet: {
                type: "dataSet",
                ref: {
                    identifier: "date",
                    type: "dataSet",
                },
                id: "date",
                title: "Date",
                description: "",
                uri: "",
                deprecated: false,
                production: true,
                unlisted: false,
            },
            dateAttributes: [
                {
                    granularity: "GDC.time.year",
                    attribute: {
                        type: "attribute",
                        ref: {
                            identifier: "date.year",
                            type: "attribute",
                        },
                        id: "date.year",
                        uri: "",
                        title: "Date - Year",
                        description: "Year",
                        deprecated: false,
                        production: true,
                        unlisted: false,
                        displayForms: [
                            {
                                type: "displayForm",
                                attribute: {
                                    type: "attribute",
                                    identifier: "date.year",
                                },
                                ref: {
                                    identifier: "date.year",
                                    type: "displayForm",
                                },
                                id: "date.year",
                                uri: "",
                                title: "Date - Year",
                                description: "Year",
                                deprecated: false,
                                production: true,
                                unlisted: false,
                            },
                        ],
                    },
                    defaultDisplayForm: {
                        type: "displayForm",
                        attribute: {
                            type: "attribute",
                            identifier: "date.year",
                        },
                        ref: {
                            identifier: "date.year",
                            type: "displayForm",
                        },
                        id: "date.year",
                        uri: "",
                        title: "Date - Year",
                        description: "Year",
                        deprecated: false,
                        production: true,
                        unlisted: false,
                    },
                },
            ],
        },
    ],
    [
        {
            id: "dataset",
            title: "Dataset",
        },
    ],
);

export const slicedLdmObjects: LdmObjects = new LdmObjects(
    [],
    [
        {
            type: "fact",
            fact: {
                type: "fact",
                id: "1",
                title: "fact title",
                description: "fact description",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "fact",
                    identifier: "1",
                },
            },
            groups: [],
        },
    ],
    [
        {
            type: "measure",
            measure: {
                type: "measure",
                id: "2",
                title: "measure title",
                description: "measure description",
                expression: "SELECT SUM({fact/1})",
                format: "",
                production: false,
                deprecated: false,
                unlisted: false,
                uri: "",
                ref: {
                    type: "measure",
                    identifier: "2",
                },
            },
            groups: [],
        },
    ],
    [
        {
            type: "parameter",
            id: "topN",
            title: "Top N",
            description: "Top N parameter",
            definition: {
                type: "NUMBER",
                defaultValue: 10,
            },
            production: false,
            deprecated: false,
            unlisted: false,
            uri: "",
            ref: {
                type: "parameter",
                identifier: "topN",
            },
        },
    ],
    [
        {
            type: "dateDataset",
            relevance: 0,
            dataSet: {
                type: "dataSet",
                ref: {
                    identifier: "date",
                    type: "dataSet",
                },
                id: "date",
                title: "Date",
                description: "",
                uri: "",
                deprecated: false,
                production: true,
                unlisted: false,
            },
            dateAttributes: [
                {
                    granularity: "GDC.time.year",
                    attribute: {
                        type: "attribute",
                        ref: {
                            identifier: "date.year",
                            type: "attribute",
                        },
                        id: "date.year",
                        uri: "",
                        title: "Date - Year",
                        description: "Year",
                        deprecated: false,
                        production: true,
                        unlisted: false,
                        displayForms: [
                            {
                                type: "displayForm",
                                attribute: {
                                    type: "attribute",
                                    identifier: "date.year",
                                },
                                ref: {
                                    identifier: "date.year",
                                    type: "displayForm",
                                },
                                id: "date.year",
                                uri: "",
                                title: "Date - Year",
                                description: "Year",
                                deprecated: false,
                                production: true,
                                unlisted: false,
                            },
                        ],
                    },
                    defaultDisplayForm: {
                        type: "displayForm",
                        attribute: {
                            type: "attribute",
                            identifier: "date.year",
                        },
                        ref: {
                            identifier: "date.year",
                            type: "displayForm",
                        },
                        id: "date.year",
                        uri: "",
                        title: "Date - Year",
                        description: "Year",
                        deprecated: false,
                        production: true,
                        unlisted: false,
                    },
                },
            ],
        },
    ],
    [
        {
            id: "dataset",
            title: "Dataset",
        },
    ],
);

export const labelElementsFunction: LabelElementsFunc = function <T extends ITigerMetadataObjectStub>(
    labels: T[],
    excluded: string[],
    options: IElementsQueryOptions,
): Promise<ILabelElementsFuncResult<T>> {
    const rejected: T[] = [];
    const elements: IAttributeElement[] = labels
        .map((label) => {
            const els = mockLabelElements.get(serializeObjRef(label.ref));
            if (!els) {
                rejected.push(label);
                return [];
            }
            return els;
        })
        .flat()
        .filter((element) =>
            // simulates SQL LIKE operator
            element.title && options.filter
                ? new RegExp(`.*${options.filter.toLowerCase()}.*`).test(element.title.toLowerCase())
                : true,
        )
        .filter((element) => {
            const els = options.elements as IElementsQueryOptionsElementsByValue;
            return els?.values?.includes(element.uri) ?? true;
        })
        .filter((element) => element.title === null || !excluded.includes(element.title));
    return Promise.resolve({
        list: {
            elements,
            isIncomplete: false,
        },
        rejected: rejected,
    });
};

export const mockLabelElements: Map<string, IAttributeElement[]> = new Map([
    [
        serializeObjRef({ type: tigerIdTypeToObjectType["label"], identifier: "4" }),
        [
            labelElement("Apricot"),
            labelElement("Banana"),
            labelElement("Coconut"),
            labelElement("Cockatrice"),
            labelElement("Date"),
            labelElement("Locomotive"),
        ],
    ],
    [
        serializeObjRef({ type: tigerIdTypeToObjectType["label"], identifier: "special" }),
        [
            labelElement('hello "example" world'),
            labelElement("goodbye\nworld"),
            labelElement('Middle-quoted\\"title'),
        ],
    ],
]);

function labelElement(title: string, uri?: string): IAttributeElement {
    return {
        title: title,
        uri: uri ?? title,
    };
}

const locale = "en-us";
export const docs = (resolveTag: string): Promise<string | undefined> => {
    return Promise.resolve(
        (docsIndex as unknown as Record<string, Record<string, string | undefined>>)[locale][resolveTag],
    );
};
