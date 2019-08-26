// (C) 2007-2018 GoodData Corporation
import { Execution, AFM } from "@gooddata/typings";
import { CSSProperties } from "react";

export interface IHeadlineDataItem {
    localIdentifier: AFM.Identifier;
    title?: string;
    value: string;
    format?: string;
    isDrillable?: boolean;
}

export interface IFormattedHeadlineDataItem {
    cssStyle?: CSSProperties;
    value: Execution.DataValue;
    isValueEmpty: boolean;
}

export interface IHeadlineData {
    primaryItem: IHeadlineDataItem;
    secondaryItem?: IHeadlineDataItem;
    tertiaryItem?: IHeadlineDataItem;
}
