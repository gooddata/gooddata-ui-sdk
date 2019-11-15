// (C) 2019 GoodData Corporation
import { GdcExecution } from "../GdcExecution";
import IResultHeaderItem = GdcExecution.IResultHeaderItem;
import IHeader = GdcExecution.IHeader;

export const attributeHeaderItem: IResultHeaderItem = {
    attributeHeaderItem: {
        uri: "/uri",
        name: "Name",
    },
};

export const measureHeaderItem: IResultHeaderItem = {
    measureHeaderItem: {
        name: "Name",
        order: 1,
    },
};

export const totalHeaderItem: IResultHeaderItem = {
    totalHeaderItem: {
        name: "Name",
        type: "asdf",
    },
};

export const measureGroupGroup: IHeader = {
    measureGroupHeader: {
        items: [
            {
                measureHeaderItem: {
                    localIdentifier: "m1",
                    name: "Senseilevel",
                    format: "###",
                },
            },
        ],
    },
};

export const attributeHeader: IHeader = {
    attributeHeader: {
        uri: "/uri",
        identifier: "id",
        localIdentifier: "a1",
        name: "Year over year",
        formOf: {
            uri: "/uri2",
            identifier: "id2",
            name: "Date of birth",
        },
    },
};
