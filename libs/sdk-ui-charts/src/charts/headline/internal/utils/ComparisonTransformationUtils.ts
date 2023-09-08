// (C) 2023 GoodData Corporation
import { IntlShape } from "react-intl";
import isNil from "lodash/isNil.js";
import isNumber from "lodash/isNumber.js";
import isString from "lodash/isString.js";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    convertDrillableItemsToPredicates,
    DataViewFacade,
    ExplicitDrill,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { DataValue } from "@gooddata/sdk-model";

import {
    CalculateAs,
    ComparisonPositionValues,
    IComparison,
    ILabelConfig,
} from "../../../../interfaces/index.js";
import { EvaluationType, IBaseHeadlineData, IBaseHeadlineItem } from "../interfaces/BaseHeadlines.js";
import { getExecutionData, IHeadlineExecutionData } from "./HeadlineTransformationUtils.js";
import { IHeadlineDataItem } from "../interfaces/Headlines.js";
import { getCalculationValuesDefault, getComparisonFormat } from "../../headlineHelper.js";
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
    const [primaryItemData, secondaryItemData] = executionData;

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

    const comparisonItem = createComparisonItem(
        executionData,
        dv.meta().isDerivedMeasure(secondaryItemHeader),
        primaryItem.data?.format,
        comparison,
        intl,
    );

    const baseHeadlineData: IBaseHeadlineData = {
        primaryItem,
        secondaryItem,
        tertiaryItem: comparisonItem,
    };

    return positionBaseHeadlineItems(baseHeadlineData, comparison);
}

function positionBaseHeadlineItems(
    baseHeadlineData: IBaseHeadlineData,
    comparison: IComparison,
): IBaseHeadlineData {
    switch (comparison?.position) {
        case ComparisonPositionValues.TOP:
            return {
                primaryItem: baseHeadlineData.tertiaryItem,
                secondaryItem: baseHeadlineData.secondaryItem,
                tertiaryItem: baseHeadlineData.primaryItem,
            };

        case ComparisonPositionValues.RIGHT:
            return {
                primaryItem: baseHeadlineData.primaryItem,
                secondaryItem: baseHeadlineData.tertiaryItem,
                tertiaryItem: baseHeadlineData.secondaryItem,
            };

        case ComparisonPositionValues.LEFT:
        case ComparisonPositionValues.AUTO:
        default:
            return baseHeadlineData;
    }
}

function createComparisonItem(
    executionData: IHeadlineExecutionData[],
    isSecondaryDerivedMeasure: boolean,
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
        evaluationType: getComparisonEvaluationType(executionData),
    };
}

function getComparisonEvaluationType(executionData: IHeadlineExecutionData[]): EvaluationType {
    const [primaryItem, secondaryItem, tertiaryItem] = executionData;
    if (!isNumeric(primaryItem.value) || !isNumeric(secondaryItem.value) || !isNumeric(tertiaryItem.value)) {
        return null;
    }

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
    executionData: IHeadlineExecutionData[],
    isSecondaryDerivedMeasure: boolean,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IHeadlineDataItem {
    const { calculationType, format, labelConfig } = comparison;
    const [, , tertiaryItemData] = executionData;

    const { measureHeaderItem } = tertiaryItemData;
    const { localIdentifier } = measureHeaderItem;

    const defaultCalculationType = isSecondaryDerivedMeasure ? CalculateAs.CHANGE : CalculateAs.RATIO;
    const { defaultFormat, defaultLabelKey } = getCalculationValuesDefault(
        calculationType ?? defaultCalculationType,
    );

    return {
        title: getComparisonTitle(labelConfig, intl.formatMessage({ id: defaultLabelKey })),
        value: getComparisonValue(executionData),
        format: getComparisonFormat(format, defaultFormat) || inheritFormat,
        localIdentifier,
    };
}

function getComparisonValue(executionData: IHeadlineExecutionData[]): string {
    const [primaryItem, secondaryItem, tertiaryItem] = executionData;
    if (!isNumeric(primaryItem.value) || !isNumeric(secondaryItem.value)) {
        return null;
    }

    const { value } = tertiaryItem;
    return isNil(value) ? value : String(value);
}

function isNumeric(value: DataValue): boolean {
    return (isNumber(value) || (isString(value) && value.trim())) && !isNaN(value as number);
}

function getComparisonTitle(labelConfig: ILabelConfig, defaultLabel: string): string {
    return labelConfig?.unconditionalValue || defaultLabel;
}
