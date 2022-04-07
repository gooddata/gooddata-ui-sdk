// (C) 2007-2022 GoodData Corporation
import { CSSProperties } from "react";
import { Identifier, DataValue } from "@gooddata/sdk-model";

export interface IHeadlineDataItem {
    localIdentifier: Identifier;
    title?: string;
    value: string;
    format?: string;
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
