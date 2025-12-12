// (C) 2023-2025 GoodData Corporation
import { type CSSProperties } from "react";

import { type IntlShape } from "react-intl";

import { ComparisonIndicators, getComparisonAriaLabelMessage } from "./ComparisonIndicator.js";
import { type IChartConfig } from "../../../../../../../interfaces/index.js";
import {
    type ComparisonDataItem,
    type EvaluationType,
    type IBaseHeadlineValueItem,
    isComparisonDataWithSubItem,
} from "../../../../interfaces/BaseHeadlines.js";
import { getComparisonColor } from "../../../../utils/ComparisonDataItemUtils.js";
import { formatItemValue } from "../../../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "../../BaseHeadlineContext.js";

function createComparisonAriaLabelFactory(
    evaluationType: EvaluationType | undefined,
    chartConfig: IChartConfig,
    dataItem?: ComparisonDataItem,
) {
    return (intl: IntlShape) => {
        if (!dataItem) {
            return undefined;
        }
        const mainItem: IBaseHeadlineValueItem = isComparisonDataWithSubItem(dataItem)
            ? dataItem.item
            : dataItem;
        const secondaryItem: IBaseHeadlineValueItem | undefined = isComparisonDataWithSubItem(dataItem)
            ? dataItem.subItem
            : undefined;

        const formattedMain = mainItem ? formatItemValue(mainItem, chartConfig) : undefined;
        const formattedSecondary = secondaryItem ? formatItemValue(secondaryItem, chartConfig) : undefined;

        const hasSecondary = !!formattedSecondary?.value;
        const message = getComparisonAriaLabelMessage(evaluationType, hasSecondary);
        if (!message) {
            return formattedMain?.value; // announce just the main value when there's no indicator
        }
        return intl.formatMessage(message, {
            mainValue: formattedMain?.value,
            secondaryValue: formattedSecondary?.value,
        });
    };
}

export const useComparisonDataItem = (
    evaluationType: EvaluationType | undefined,
    dataItem?: ComparisonDataItem,
) => {
    const { config } = useBaseHeadline();
    const { colorConfig, isArrowEnabled } = config.comparison;

    const color = getComparisonColor(colorConfig, evaluationType, config.colorPalette);
    const indicator = isArrowEnabled ? ComparisonIndicators[evaluationType] : null;

    // Prepare aria-label factory using the same formatting logic as ComparisonValue
    const comparisonAriaLabelFactory = createComparisonAriaLabelFactory(
        isArrowEnabled ? evaluationType : undefined,
        config,
        dataItem,
    );

    const style: CSSProperties = {
        ...(color ? { color } : {}),
    };
    return {
        style,
        indicator,
        comparisonAriaLabelFactory,
    };
};
