// (C) 2023 GoodData Corporation
import { IntlShape } from "react-intl";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    convertDrillableItemsToPredicates,
    DataViewFacade,
    ExplicitDrill,
    HeadlineElementType,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import BaseHeadlineDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/BaseHeadlineDataItem.js";
import { CalculationType, IComparison } from "../../../../interfaces/index.js";
import { IHeadlineDataItem } from "../interfaces/Headlines.js";
import {
    createHeadlineDataItem,
    getExecutionData,
    IHeadlineExecutionData,
} from "./HeadlineTransformationUtils.js";
import { IBaseHeadlineData, IBaseHeadlineItem } from "../interfaces/BaseHeadlines.js";
import { CALCULATION_VALUES_DEFAULT } from "../interfaces/ComparisonHeadlines.js";

export function getComparisonBaseHeadlineData(
    dataView: IDataView,
    drillableItems: ExplicitDrill[],
    comparison: IComparison,
    intl: IntlShape,
): IBaseHeadlineData {
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

    const dv = DataViewFacade.for(dataView);
    const executionData = getExecutionData(dv);
    const [primaryItemHeader, secondaryItemHeader] = dv.meta().measureDescriptors();
    const [primaryItemData, secondaryItemData, tertiaryItemData] = executionData;

    const primaryItem = createBaseHeadlineItem(
        primaryItemData,
        isSomeHeaderPredicateMatched(drillablePredicates, primaryItemHeader, dv),
        "primaryValue",
    );

    const secondaryItem = createBaseHeadlineItem(
        secondaryItemData,
        isSomeHeaderPredicateMatched(drillablePredicates, secondaryItemHeader, dv),
        "secondaryValue",
    );

    const tertiaryItem = createComparisonItem(tertiaryItemData, primaryItem.data?.format, comparison, intl);

    return {
        primaryItem,
        secondaryItem,
        tertiaryItem,
    };
}

function createComparisonDataItem(
    executionData: IHeadlineExecutionData,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IHeadlineDataItem {
    const { value, measureHeaderItem } = executionData;
    const { localIdentifier } = measureHeaderItem;
    const { format, labelKey } = getCalculationValuesDefault(comparison.calculationType);

    return {
        title: intl.formatMessage({ id: labelKey }),
        value: value ? String(value) : null,
        format: format || inheritFormat,
        localIdentifier,
    };
}

function createBaseHeadlineItem(
    executionData: IHeadlineExecutionData,
    isDrillable: boolean,
    elementType: HeadlineElementType,
): IBaseHeadlineItem {
    const data = createHeadlineDataItem(executionData, isDrillable);

    return {
        data,
        elementType,
        baseHeadlineDataItemComponent: BaseHeadlineDataItem,
    };
}

function getCalculationValuesDefault(calculationType: CalculationType = CalculationType.CHANGE) {
    return CALCULATION_VALUES_DEFAULT[calculationType];
}

function createComparisonItem(
    executionData: IHeadlineExecutionData,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IBaseHeadlineItem {
    const data = createComparisonDataItem(executionData, inheritFormat, comparison, intl);

    return {
        data,
        // TODO: should be introduced ComparisonDataItem while implementing indicator and color (EGL-147)
        baseHeadlineDataItemComponent: BaseHeadlineDataItem,
    };
}
