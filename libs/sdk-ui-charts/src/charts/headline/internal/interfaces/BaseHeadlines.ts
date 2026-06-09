// (C) 2023-2026 GoodData Corporation

import { type ComponentType, type RefObject } from "react";

import { isEmpty } from "lodash-es";

import { type HeadlineElementType } from "@gooddata/sdk-ui";

import { type IComparison } from "../../../../interfaces/comparison.js";

import { type IHeadlineDataItem } from "./Headlines.js";

export const COMPARISON_DEFAULT_OBJECT: IComparison = {
    enabled: true,
};

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

/**
 * A `DataItemComponent<IHeadlineDataItem>`, etc. is basically equivalent to `typeof BaseHeadlineDataItem` (the component),
 * but makes sure there are no cyclical dependencies (dependency cruiser does not exclude type only imports from the circular check).
 */
export type DataItemComponent<T extends IBaseHeadlineTitle> = ComponentType<
    IBaseHeadlineDataItemProps<T> & IWithTitleProps<T>
>;

export type IBaseHeadlineItem = (
    | { baseHeadlineDataItemComponent: DataItemComponent<IHeadlineDataItem>; data: IHeadlineDataItem }
    | { baseHeadlineDataItemComponent: DataItemComponent<IComparisonDataItem>; data: IComparisonDataItem }
    | {
          baseHeadlineDataItemComponent: DataItemComponent<IComparisonDataWithSubItem>;
          data: IComparisonDataWithSubItem;
      }
) & {
    evaluationType?: EvaluationType | null;
    elementType?: HeadlineElementType;
};

// Note: this type should be used only for specific casting purposes as it is currently used.
export type BaseHeadlineDataItemComponentType = ComponentType<
    IBaseHeadlineDataItemProps<IBaseHeadlineItem["data"]> & {
        shouldHideTitle?: boolean;
        titleRef?: RefObject<HTMLDivElement>;
        elementType?: HeadlineElementType;
    }
>;

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

export interface IBaseHeadlineData {
    primaryItem: IBaseHeadlineItem;
    secondaryItem?: IBaseHeadlineItem | null;
    tertiaryItem?: IBaseHeadlineItem | null;
}

export interface IBaseHeadlineDataItemProps<T> {
    dataItem: T;
    evaluationType?: EvaluationType | null;
    onValueOverflow?: (isOverflowing: boolean) => void;
    measurementTrigger?: number; // Used to trigger remeasurement
    includeHeightCheck?: boolean;
}
