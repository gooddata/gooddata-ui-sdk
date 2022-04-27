// (C) 2022 GoodData Corporation

import { CodeOptionType, DEFAULT_HEIGHT, InsightCodeType, UnitsType } from "./EmbedInsightDialogBase/types";

/**
 * @internal
 */
export const getDefaultOptions = (codeType: InsightCodeType): CodeOptionType => {
    if (codeType === "definition") {
        return {
            type: "definition",
            includeConfiguration: true,
            customHeight: true,
        };
    }

    return {
        type: "reference",
        displayTitle: true,
        customHeight: true,
    };
};

/**
 * @internal
 */
export const getHeightWithUnits = (codeOption: CodeOptionType): string | number => {
    const unit = codeOption.unit ? codeOption.unit : "px";

    const customHeightValue = codeOption.height ? codeOption.height : getDefaultHeightByUnit(unit);
    const height = codeOption.customHeight ? customHeightValue : getDefaultHeightByUnit(unit);

    if (unit === "px") {
        return Number(height);
    }

    return `${height}${unit}`;
};

/**
 * @internal
 */
export const getDefaultHeightByUnit = (unit: UnitsType): string => {
    return DEFAULT_HEIGHT[unit];
};
