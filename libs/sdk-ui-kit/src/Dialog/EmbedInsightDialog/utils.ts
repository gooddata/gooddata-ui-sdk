// (C) 2022-2025 GoodData Corporation

import {
    DEFAULT_HEIGHT,
    DEFAULT_LOCALE,
    type EmbedOptionsType,
    type EmbedType,
    type UnitsType,
} from "./EmbedInsightDialogBase/types.js";

/**
 * @internal
 */
export const getDefaultEmbedTypeOptions = (embedType: EmbedType): EmbedOptionsType => {
    if (embedType === "react") {
        return {
            type: "react",
            codeType: "ts",
            componentType: "reference",
            displayConfiguration: true,
            customHeight: true,
        };
    }

    return {
        type: "webComponents",
        displayTitle: true,
        customTitle: false,
        allowLocale: false,
        locale: DEFAULT_LOCALE,
        customHeight: true,
    };
};

/**
 * @internal
 */
export const getHeightWithUnitsForEmbedCode = (codeOption: EmbedOptionsType): string | number => {
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
