// (C) 2023 GoodData Corporation
import { IntlShape } from "react-intl";
import isNil from "lodash/isNil.js";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    convertDrillableItemsToPredicates,
    DataViewFacade,
    ExplicitDrill,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { CalculateAs, IComparison } from "../../../../interfaces/index.js";
import { EvaluationType, IBaseHeadlineData, IBaseHeadlineItem } from "../interfaces/BaseHeadlines.js";
import { getExecutionData, IHeadlineExecutionData } from "./HeadlineTransformationUtils.js";
import { IHeadlineDataItem } from "../interfaces/Headlines.js";
import {
    getCalculationValuesDefault,
    getComparisonFormat,
    getComparisonTitle,
} from "../../headlineHelper.js";
import ComparisonDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/ComparisonDataItem.js";
import { createBaseHeadlineItem } from "./BaseHeadlineTransformationUtils.js";

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

    const defaultCalculationType = isSecondaryDerivedMeasure ? CalculateAs.CHANGE : CalculateAs.RATIO;
    const { defaultFormat, defaultLabelKey } = getCalculationValuesDefault(
        calculationType ?? defaultCalculationType,
    );

    return {
        title: getComparisonTitle(labelConfig, intl.formatMessage({ id: defaultLabelKey })),
        value: isNil(value) ? value : String(value),
        format: getComparisonFormat(format, defaultFormat) || inheritFormat,
        localIdentifier,
    };
}
