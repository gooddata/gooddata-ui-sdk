// (C) 2023-2025 GoodData Corporation
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IHeadlineDataItem } from "./Headlines.js";
import { ComponentType, RefObject } from "react";
import { IComparison } from "../../../../interfaces/index.js";

export const COMPARISON_DEFAULT_OBJECT: IComparison = {
    enabled: true,
};

export type BaseHeadlineDataItemComponentType<T> = ComponentType<
    IBaseHeadlineDataItemProps<T> & IWithTitleProps<T> & IWithDrillableItemProps<T>
>;

export interface IBaseHeadlineTitle {
    title?: string;
}

export interface IBaseHeadlineDrillable {
    isDrillable?: boolean;
}

export interface IWithTitleProps<T extends IBaseHeadlineTitle> {
    dataItem: T;
    shouldHideTitle?: boolean;
    titleRef?: RefObject<HTMLDivElement>;
}

export interface IWithDrillableItemProps<T extends IBaseHeadlineDrillable> {
    dataItem: T;
    elementType?: HeadlineElementType;
}

export interface IBaseHeadlineValueItem {
    value: string;
    format?: string;
}

export enum EvaluationType {
    NEGATIVE_VALUE = "negative",
    EQUALS_VALUE = "equals",
    POSITIVE_VALUE = "positive",
}

export interface IBaseHeadlineItem<T> {
    data: T;
    baseHeadlineDataItemComponent: BaseHeadlineDataItemComponentType<T>;
    evaluationType?: EvaluationType;
    elementType?: HeadlineElementType;
}

export interface IComparisonDataItem extends IBaseHeadlineValueItem, IBaseHeadlineTitle {}

export interface IComparisonDataWithSubItem extends IBaseHeadlineTitle {
    item: IBaseHeadlineValueItem;
    subItem: IBaseHeadlineValueItem;
}

export type BaseHeadlineItemAccepted = IHeadlineDataItem | IComparisonDataItem | IComparisonDataWithSubItem;

export interface IBaseHeadlineData {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    secondaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    tertiaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
}

export interface IBaseHeadlineDataItemProps<T> {
    dataItem: T;
    evaluationType: EvaluationType;
    onValueOverflow?: (isOverflowing: boolean) => void;
    measurementTrigger?: number; // Used to trigger remeasurement
}
