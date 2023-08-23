// (C) 2023 GoodData Corporation
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IHeadlineDataItem } from "./Headlines.js";
import { ComponentType, RefObject } from "react";

export type BaseHeadlineDataItemComponentType = ComponentType<
    IBaseHeadlineDataItemProps & IWithDrillableItemProps & IWithTitleProps
>;

export enum EvaluationType {
    NEGATIVE_VALUE = "negative",
    EQUALS_VALUE = "equals",
    POSITIVE_VALUE = "positive",
}

export interface IBaseHeadlineItem {
    data: IHeadlineDataItem;
    baseHeadlineDataItemComponent: BaseHeadlineDataItemComponentType;
    evaluationType?: EvaluationType;
    elementType?: HeadlineElementType;
}

export interface IBaseHeadlineData {
    primaryItem: IBaseHeadlineItem;
    secondaryItem?: IBaseHeadlineItem;
    tertiaryItem?: IBaseHeadlineItem;
}

export interface IBaseHeadlineDataItemProps {
    dataItem: IHeadlineDataItem;
    evaluationType: EvaluationType;
}

export interface IWithDrillableItemProps {
    dataItem: IHeadlineDataItem;
    elementType?: HeadlineElementType;
}

export interface IWithTitleProps {
    dataItem: IHeadlineDataItem;
    shouldHideTitle?: boolean;
    titleRef?: RefObject<HTMLDivElement>;
}
