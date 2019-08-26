// (C) 2007-2018 GoodData Corporation
export interface IAttributeHeader {
    type: "attrLabel";
    id: string;
    uri: string;
    title: string;
}

export interface IMetricHeader {
    type: "metric";
    id: string;
    uri?: string;
    title: string;
    format?: string;
}

export type Header = IAttributeHeader | IMetricHeader;
