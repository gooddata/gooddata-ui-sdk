// (C) 2007-2025 GoodData Corporation
import { CSSProperties } from "react";

import { DataValue, Identifier } from "@gooddata/sdk-model";

export interface IHeadlineDataItem {
    localIdentifier: Identifier;
    value: string;
    title?: string;
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
