// (C) 2023 GoodData Corporation
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IHeadlineDataItem } from "./Headlines.js";
import { ComponentType, RefObject } from "react";

export type BaseHeadlineDataItemComponentType = ComponentType<
    IBaseHeadlineDataItemProps & IWithDrillableItemProps & IWithTitleProps
>;

export interface IBaseHeadlineItem {
    data: IHeadlineDataItem;
    baseHeadlineDataItemComponent: BaseHeadlineDataItemComponentType;
    elementType?: HeadlineElementType;
}

export interface IBaseHeadlineData {
    primaryItem: IBaseHeadlineItem;
    secondaryItem?: IBaseHeadlineItem;
    tertiaryItem?: IBaseHeadlineItem;
}

export interface IBaseHeadlineDataItemProps {
    dataItem: IHeadlineDataItem;
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
