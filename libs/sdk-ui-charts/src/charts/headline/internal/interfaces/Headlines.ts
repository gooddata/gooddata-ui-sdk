// (C) 2007-2025 GoodData Corporation

import { type CSSProperties } from "react";

import { type DataValue, type Identifier } from "@gooddata/sdk-model";

export interface IHeadlineDataItem {
    localIdentifier: Identifier;
    value: string | null;
    title?: string;
    format: string | null;
    isDrillable?: boolean;
}

export interface IFormattedHeadlineDataItem {
    cssStyle?: CSSProperties;
    value: DataValue;
    isValueEmpty: boolean;
}

export interface IHeadlineData {
    primaryItem: IHeadlineDataItem;
    secondaryItem?: IHeadlineDataItem;
    tertiaryItem?: IHeadlineDataItem;
}
