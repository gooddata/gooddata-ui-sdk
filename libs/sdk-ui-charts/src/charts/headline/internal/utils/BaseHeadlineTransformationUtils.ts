// (C) 2023-2025 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type IMeasureDescriptor } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type ExplicitDrill,
    type HeadlineElementType,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import {
    type IHeadlineExecutionData,
    createHeadlineDataItem,
    getExecutionData,
} from "./HeadlineTransformationUtils.js";
import { BaseHeadlineDataItem } from "../headlines/baseHeadline/baseHeadlineDataItems/BaseHeadlineDataItem.js";
import {
    type BaseHeadlineItemAccepted,
    type IBaseHeadlineData,
    type IBaseHeadlineItem,
} from "../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../interfaces/Headlines.js";

export function getBaseHeadlineData(dataView: IDataView, drillableItems: ExplicitDrill[]): IBaseHeadlineData {
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems ?? []);

    const dv = DataViewFacade.for(dataView);
    const executionData = getExecutionData(dv);
    const itemHeaders = dv.meta().measureDescriptors();

    const primaryItem = createBaseHeadlineItem(
        executionData[0],
        isSomeHeaderPredicateMatched(drillablePredicates, itemHeaders[0], dv),
        "primaryValue",
    );

    let secondaryItemData: IHeadlineExecutionData;
    let secondaryItemHeader: IMeasureDescriptor;
    let tertiaryItemData: IHeadlineExecutionData;
    let tertiaryItemHeader: IMeasureDescriptor;
    if (executionData.length === 3) {
        // There are 2 secondary metrics
        // The left item will be the second metric
        // The right item will be the third metric
        secondaryItemData = executionData[2];
        secondaryItemHeader = itemHeaders[2];
        tertiaryItemData = executionData[1];
        tertiaryItemHeader = itemHeaders[1];
    } else {
        secondaryItemData = executionData[1];
        secondaryItemHeader = itemHeaders[1];
    }

    const secondaryItem = createBaseHeadlineItem(
        secondaryItemData,
        secondaryItemHeader && isSomeHeaderPredicateMatched(drillablePredicates, secondaryItemHeader, dv),
        "secondaryValue",
    );

    const tertiaryItem = createBaseHeadlineItem(
        tertiaryItemData,
        tertiaryItemHeader && isSomeHeaderPredicateMatched(drillablePredicates, tertiaryItemHeader, dv),
        "secondaryValue",
    );

    return {
        primaryItem: primaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
        secondaryItem: secondaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
        tertiaryItem: tertiaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
    };
}

export function createBaseHeadlineItem(
    executionData: IHeadlineExecutionData,
    isDrillable: boolean,
    elementType: HeadlineElementType,
): IBaseHeadlineItem<IHeadlineDataItem> {
    const data = createHeadlineDataItem(executionData, isDrillable);

    return data
        ? {
              data,
              elementType,
              baseHeadlineDataItemComponent: BaseHeadlineDataItem,
          }
        : null;
}
