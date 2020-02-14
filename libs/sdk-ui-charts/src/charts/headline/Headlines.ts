// (C) 2007-2018 GoodData Corporation
import { CSSProperties } from "react";
import { Identifier } from "@gooddata/sdk-model";
import { DataValue } from "@gooddata/sdk-backend-spi";

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
