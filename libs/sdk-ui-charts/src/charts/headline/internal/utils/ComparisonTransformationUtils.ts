// (C) 2023-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type DataValue } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type ExplicitDrill,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { createBaseHeadlineItem } from "./BaseHeadlineTransformationUtils.js";
import { type IHeadlineExecutionData, getExecutionData } from "./HeadlineTransformationUtils.js";
import {
    CalculateAs,
    type CalculationType,
    ComparisonPositionValues,
    type IComparison,
    type ILabelConfig,
} from "../../../../interfaces/comparison.js";
import {
    type IDefaultLabelKeys,
    getCalculationValuesDefault,
    getComparisonFormat,
} from "../../headlineHelper.js";
import { ComparisonDataItem } from "../headlines/baseHeadline/baseHeadlineDataItems/comparisonItems/ComparisonDataItem.js";
import { ComparisonDataWithSubItem } from "../headlines/baseHeadline/baseHeadlineDataItems/comparisonItems/ComparisonDataWithSubItem.js";
import {
    type BaseHeadlineDataItemComponentType,
    type BaseHeadlineItemAccepted,
    EvaluationType,
    type IBaseHeadlineData,
    type IBaseHeadlineItem,
    type IComparisonDataItem,
    type ComparisonDataItem as IComparisonDataItemType,
    type IComparisonDataWithSubItem,
} from "../interfaces/BaseHeadlines.js";

export function getComparisonBaseHeadlineData(
    dataView: IDataView,
    drillableItems: ExplicitDrill[] | undefined,
    comparison: IComparison,
    intl: IntlShape,
): IBaseHeadlineData {
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems ?? []);

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
        primaryItem?.data?.format,
        comparison,
        intl,
    );

    const baseHeadlineData: IBaseHeadlineData = {
        primaryItem: primaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
        secondaryItem: secondaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
        tertiaryItem: comparisonItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
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
                primaryItem: baseHeadlineData.tertiaryItem!,
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
    inheritFormat: string | null | undefined,
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
            baseHeadlineDataItemComponent:
                ComparisonDataWithSubItem as BaseHeadlineDataItemComponentType<IComparisonDataItemType>,
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
            baseHeadlineDataItemComponent:
                ComparisonDataItem as BaseHeadlineDataItemComponentType<IComparisonDataItemType>,
            evaluationType: evaluationType,
        };
    }
}

function getComparisonEvaluationType(executionData: IHeadlineExecutionData[]): EvaluationType | null {
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
    evaluationType: EvaluationType | null,
    inheritFormat: string | null | undefined,
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
            labelConfig ?? {},
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
    evaluationType: EvaluationType | null,
    inheritFormat: string | null | undefined,
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

function getComparisonValue(executionData: IHeadlineExecutionData[], isSubValue?: boolean): string | null {
    const [primaryItem, secondaryItem, tertiaryItem, quaternaryItem] = executionData;
    if (!isNumeric(primaryItem.value) || !isNumeric(secondaryItem.value)) {
        return null;
    }

    const { value } = isSubValue ? quaternaryItem : tertiaryItem;
    return value === null || value === undefined ? null : String(value);
}

function isNumeric(value: DataValue): boolean {
    return (
        (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
        !isNaN(value as number)
    );
}

function getComparisonTitle(
    labelConfig: ILabelConfig | undefined,
    defaultLabelKeys: IDefaultLabelKeys,
    evaluationType: EvaluationType | undefined | null,
    calculationType: CalculationType | undefined,
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
