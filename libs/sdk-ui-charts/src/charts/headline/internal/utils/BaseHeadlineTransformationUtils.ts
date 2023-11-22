// (C) 2023 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    convertDrillableItemsToPredicates,
    DataViewFacade,
    ExplicitDrill,
    HeadlineElementType,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-model";

import BaseHeadlineDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/BaseHeadlineDataItem.js";
import {
    createHeadlineDataItem,
    getExecutionData,
    IHeadlineExecutionData,
} from "./HeadlineTransformationUtils.js";
import { IBaseHeadlineData, IBaseHeadlineItem } from "../interfaces/BaseHeadlines.js";
import { IHeadlineDataItem } from "../interfaces/Headlines.js";

export function getBaseHeadlineData(dataView: IDataView, drillableItems: ExplicitDrill[]): IBaseHeadlineData {
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

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
        primaryItem,
        secondaryItem,
        tertiaryItem,
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
