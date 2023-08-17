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
import { IMeasureDescriptor } from "@gooddata/sdk-model";

import BaseHeadlineDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/BaseHeadlineDataItem.js";
import ComparisonDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/ComparisonDataItem.js";
import { CalculationType, IComparison } from "../../../../interfaces/index.js";
import { IHeadlineDataItem } from "../interfaces/Headlines.js";
import {
    createHeadlineDataItem,
    getExecutionData,
    IHeadlineExecutionData,
} from "./HeadlineTransformationUtils.js";
import { IBaseHeadlineData, IBaseHeadlineItem, EvaluationType } from "../interfaces/BaseHeadlines.js";
import {
    getCalculationValuesDefault,
    getComparisonFormat,
    getComparisonTitle,
} from "../../headlineHelper.js";

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

    const comparisonEvaluationType = getComparisonEvaluationType(executionData);
    const tertiaryItem = createComparisonItem(
        tertiaryItemData,
        dv.meta().isDerivedMeasure(secondaryItemHeader),
        comparisonEvaluationType,
        primaryItem.data?.format,
        comparison,
        intl,
    );

    return {
        primaryItem,
        secondaryItem,
        tertiaryItem,
    };
}

function createComparisonDataItem(
    executionData: IHeadlineExecutionData,
    isSecondaryDerivedMeasure: boolean,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IHeadlineDataItem {
    const { calculationType, format, labelConfig } = comparison;
    const { value, measureHeaderItem } = executionData;
    const { localIdentifier } = measureHeaderItem;

    const defaultCalculationType = isSecondaryDerivedMeasure ? CalculationType.CHANGE : CalculationType.RATIO;
    const { defaultFormat, defaultLabelKey } = getCalculationValuesDefault(
        calculationType ?? defaultCalculationType,
    );

    return {
        title: getComparisonTitle(labelConfig, intl.formatMessage({ id: defaultLabelKey })),
        value: String(value),
        format: getComparisonFormat(format, defaultFormat) || inheritFormat,
        localIdentifier,
    };
}

function createBaseHeadlineItem(
    executionData: IHeadlineExecutionData,
    isDrillable: boolean,
    elementType: HeadlineElementType,
): IBaseHeadlineItem {
    const data = createHeadlineDataItem(executionData, isDrillable);

    return data
        ? {
              data,
              elementType,
              baseHeadlineDataItemComponent: BaseHeadlineDataItem,
          }
        : null;
}

function createComparisonItem(
    executionData: IHeadlineExecutionData,
    isSecondaryDerivedMeasure: boolean,
    comparisonEvaluationType: EvaluationType,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IBaseHeadlineItem {
    const data = createComparisonDataItem(
        executionData,
        isSecondaryDerivedMeasure,
        inheritFormat,
        comparison,
        intl,
    );

    return {
        data,
        baseHeadlineDataItemComponent: ComparisonDataItem,
        evaluationType: comparisonEvaluationType,
    };
}

function getComparisonEvaluationType(executionData: IHeadlineExecutionData[]): EvaluationType {
    const [primaryItem, secondaryItem] = executionData;

    const primaryItemValue = primaryItem.value ?? 0;
    const secondaryItemValue = secondaryItem.value ?? 0;

    if (primaryItemValue > secondaryItemValue) {
        return EvaluationType.POSITIVE_VALUE;
    }

    if (primaryItemValue < secondaryItemValue) {
        return EvaluationType.NEGATIVE_VALUE;
    }

    return EvaluationType.EQUALS_VALUE;
}
