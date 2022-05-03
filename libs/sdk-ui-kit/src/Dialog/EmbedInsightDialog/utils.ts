// (C) 2022 GoodData Corporation

import { CodeOptionType, DEFAULT_HEIGHT, InsightCodeType, UnitsType } from "./EmbedInsightDialogBase/types";

/**
 * @internal
 */
export const getDefaultEmbedCodeOptions = (codeType: InsightCodeType): CodeOptionType => {
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
export const getHeightWithUnitsForEmbedCode = (codeOption: CodeOptionType): string | number => {
    const unit = codeOption.unit ? codeOption.unit : "px";

    const customHeightValue = codeOption.height
        ? codeOption.height
        : getDefaultHeightForEmbedCodeByUnit(unit);
    const height = codeOption.customHeight ? customHeightValue : getDefaultHeightForEmbedCodeByUnit(unit);

    if (unit === "px") {
        return Number(height);
    }

    return `${height}${unit}`;
};

/**
 * @internal
 */
export const getDefaultHeightForEmbedCodeByUnit = (unit: UnitsType): string => {
    return DEFAULT_HEIGHT[unit];
};
