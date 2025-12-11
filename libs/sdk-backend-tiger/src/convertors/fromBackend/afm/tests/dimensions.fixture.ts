// (C) 2020-2025 GoodData Corporation

import { ResultDimension } from "@gooddata/api-client-tiger";

export const mockDimensions: ResultDimension[] = [
    {
        headers: [
            {
                measureGroupHeaders: [
                    {
                        localIdentifier: "measureLocalId",
                        format: "#,##0.00",
                    },
                ],
            },
        ],
        localIdentifier: "headers1",
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "fd48e8fd32b54b1baba3e3ccdd719f26",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                    valueType: "TEXT",
                },
            },
        ],
        localIdentifier: "headers2",
    },
];

export const mockMultipleDimensions: ResultDimension[] = [
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr1",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                    valueType: "TEXT",
                },
            },
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr2",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                    valueType: "TEXT",
                },
            },
        ],
        localIdentifier: "headers1",
    },
    {
        headers: [
            {
                measureGroupHeaders: [
                    {
                        localIdentifier: "measureLocalId",
                        format: "#,##0.00",
                    },
                ],
            },
        ],
        localIdentifier: "headers2",
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr3",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                    valueType: "TEXT",
                },
            },
        ],
        localIdentifier: "headers3",
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "hyperlink.label", type: "label" },
                    localIdentifier: "localAttr4",
                    labelName: "Hyperlink",
                    primaryLabel: { id: "hyperlink.label", type: "label" },
                    attribute: { id: "hyperlink.attr", type: "attribute" },
                    attributeName: "Hyperlink",
                    valueType: "HYPERLINK",
                },
            },
        ],
        localIdentifier: "headers4",
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "image.label", type: "label" },
                    localIdentifier: "localAttr5",
                    labelName: "Image",
                    primaryLabel: { id: "image.label", type: "label" },
                    attribute: { id: "image.attr", type: "attribute" },
                    attributeName: "Image",
                    valueType: "IMAGE",
                },
            },
        ],
        localIdentifier: "headers5",
    },
];

export const mockGeoAreaDimensions: ResultDimension[] = [
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "geo_area.label", type: "label" },
                    localIdentifier: "geoAreaAttr",
                    labelName: "Geo Area",
                    primaryLabel: { id: "geo_area.label", type: "label" },
                    attribute: { id: "geo_area.attribute", type: "attribute" },
                    attributeName: "Geo Area",
                    valueType: "TEXT",
                    geoAreaConfig: {
                        collection: { id: "regions" },
                    },
                },
            },
        ],
        localIdentifier: "geoAreaDimension",
    },
];
