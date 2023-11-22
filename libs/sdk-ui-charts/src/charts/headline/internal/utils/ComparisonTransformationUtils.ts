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
    CalculationType,
    ComparisonPositionValues,
    IComparison,
    ILabelConfig,
} from "../../../../interfaces/index.js";
import {
    EvaluationType,
    IBaseHeadlineData,
    IBaseHeadlineItem,
    IComparisonDataItem,
    IComparisonDataWithSubItem,
} from "../interfaces/BaseHeadlines.js";
import { getExecutionData, IHeadlineExecutionData } from "./HeadlineTransformationUtils.js";
import { getCalculationValuesDefault, getComparisonFormat, IDefaultLabelKeys } from "../../headlineHelper.js";
import { createBaseHeadlineItem } from "./BaseHeadlineTransformationUtils.js";
import ComparisonDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/comparisonItems/ComparisonDataItem.js";
import ComparisonDataWithSubItem from "../headlines/baseHeadline/baseHeadlineDataItems/comparisonItems/ComparisonDataWithSubItem.js";

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
): IBaseHeadlineItem<IComparisonDataItem | IComparisonDataWithSubItem> {
    const [, , , quaternaryItem] = executionData;
    const evaluationType = getComparisonEvaluationType(executionData);
    if (quaternaryItem) {
        return {
            data: createComparisonDataWithSubItem(
                executionData,
                evaluationType,
                inheritFormat,
                comparison,
                intl,
            ),
            baseHeadlineDataItemComponent: ComparisonDataWithSubItem,
            evaluationType: evaluationType,
        };
    } else {
        return {
            data: createComparisonDataItem(
                executionData,
                isSecondaryDerivedMeasure,
                evaluationType,
                inheritFormat,
                comparison,
                intl,
            ),
            baseHeadlineDataItemComponent: ComparisonDataItem,
            evaluationType: evaluationType,
        };
    }
}

function getComparisonEvaluationType(executionData: IHeadlineExecutionData[]): EvaluationType {
    const [primaryItem, secondaryItem, tertiaryItem, quaternaryItem] = executionData;
    if (
        !isNumeric(primaryItem.value) ||
        !isNumeric(secondaryItem.value) ||
        (!isNumeric(tertiaryItem.value) && !isNumeric(quaternaryItem?.value))
    ) {
        return null;
    }

    const primaryItemValue = Number(primaryItem.value ?? 0);
    const secondaryItemValue = Number(secondaryItem.value ?? 0);

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
    evaluationType: EvaluationType,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IComparisonDataItem {
    const { calculationType, format, labelConfig } = comparison;

    const defaultCalculationType = isSecondaryDerivedMeasure ? CalculateAs.CHANGE : CalculateAs.RATIO;
    const { defaultFormat, defaultLabelKeys } = getCalculationValuesDefault(
        calculationType ?? defaultCalculationType,
    );

    return {
        title: getComparisonTitle(
            labelConfig,
            defaultLabelKeys,
            evaluationType,
            calculationType ?? defaultCalculationType,
            intl,
        ),
        value: getComparisonValue(executionData),
        format: getComparisonFormat(format, defaultFormat) || inheritFormat,
    };
}

function createComparisonDataWithSubItem(
    executionData: IHeadlineExecutionData[],
    evaluationType: EvaluationType,
    inheritFormat: string,
    comparison: IComparison,
    intl: IntlShape,
): IComparisonDataWithSubItem {
    const { calculationType, format, subFormat, labelConfig } = comparison;
    const { defaultFormat, defaultSubFormat, defaultLabelKeys } =
        getCalculationValuesDefault(calculationType);

    return {
        title: getComparisonTitle(labelConfig, defaultLabelKeys, evaluationType, calculationType, intl),
        item: {
            value: getComparisonValue(executionData),
            format: getComparisonFormat(format, defaultFormat) || inheritFormat,
        },
        subItem: {
            value: getComparisonValue(executionData, true),
            format: getComparisonFormat(subFormat, defaultSubFormat) || inheritFormat,
        },
    };
}

function getComparisonValue(executionData: IHeadlineExecutionData[], isSubValue?: boolean): string {
    const [primaryItem, secondaryItem, tertiaryItem, quaternaryItem] = executionData;
    if (!isNumeric(primaryItem.value) || !isNumeric(secondaryItem.value)) {
        return null;
    }

    const { value } = isSubValue ? quaternaryItem : tertiaryItem;
    return isNil(value) ? value : String(value);
}

function isNumeric(value: DataValue): boolean {
    return (isNumber(value) || (isString(value) && value.trim())) && !isNaN(value as number);
}

function getComparisonTitle(
    labelConfig: ILabelConfig,
    defaultLabelKeys: IDefaultLabelKeys,
    evaluationType: EvaluationType,
    calculationType: CalculationType,
    intl: IntlShape,
): string {
    if (labelConfig?.isConditional && calculationType !== CalculateAs.RATIO) {
        switch (evaluationType) {
            case EvaluationType.POSITIVE_VALUE:
                return labelConfig?.positive || intl.formatMessage({ id: defaultLabelKeys.positiveKey });
            case EvaluationType.NEGATIVE_VALUE:
                return labelConfig?.negative || intl.formatMessage({ id: defaultLabelKeys.negativeKey });
            default:
                return labelConfig?.equals || intl.formatMessage({ id: defaultLabelKeys.equalsKey });
        }
    }
    return labelConfig?.unconditionalValue || intl.formatMessage({ id: defaultLabelKeys.nonConditionalKey });
}
