// (C) 2023-2025 GoodData Corporation

import { type ComponentType, type RefObject } from "react";

import { isEmpty } from "lodash-es";

import { type HeadlineElementType } from "@gooddata/sdk-ui";

import { type IHeadlineDataItem } from "./Headlines.js";
import { type IComparison } from "../../../../interfaces/index.js";

export const COMPARISON_DEFAULT_OBJECT: IComparison = {
    enabled: true,
};

export type BaseHeadlineDataItemComponentType<T extends IBaseHeadlineTitle & IBaseHeadlineDrillable> =
    ComponentType<IBaseHeadlineDataItemProps<T> & IWithTitleProps<T> & IWithDrillableItemProps<T>>;

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
    value: string | null;
    format?: string | null;
}

export enum EvaluationType {
    NEGATIVE_VALUE = "negative",
    EQUALS_VALUE = "equals",
    POSITIVE_VALUE = "positive",
}

export interface IBaseHeadlineItem<T extends IBaseHeadlineTitle & IBaseHeadlineDrillable> {
    data: T;
    baseHeadlineDataItemComponent: BaseHeadlineDataItemComponentType<T>;
    evaluationType?: EvaluationType | undefined | null;
    elementType?: HeadlineElementType;
}

export interface IComparisonDataItem extends IBaseHeadlineValueItem, IBaseHeadlineTitle {}

export interface IComparisonDataWithSubItem extends IBaseHeadlineTitle {
    item: IBaseHeadlineValueItem;
    subItem: IBaseHeadlineValueItem;
}

export type ComparisonDataItem = IComparisonDataItem | IComparisonDataWithSubItem;

export function isComparisonDataWithSubItem(
    dataItem: ComparisonDataItem,
): dataItem is IComparisonDataWithSubItem {
    return !isEmpty(dataItem) && (dataItem as IComparisonDataWithSubItem).subItem !== undefined;
}

export type BaseHeadlineItemAccepted = IHeadlineDataItem | ComparisonDataItem;

export interface IBaseHeadlineData {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    secondaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted> | null;
    tertiaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted> | null;
}

export interface IBaseHeadlineDataItemProps<T> {
    dataItem: T;
    evaluationType?: EvaluationType | null;
    onValueOverflow?: (isOverflowing: boolean) => void;
    measurementTrigger?: number; // Used to trigger remeasurement
    includeHeightCheck?: boolean;
}
