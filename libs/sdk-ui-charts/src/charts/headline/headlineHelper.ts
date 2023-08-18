// (C) 2023 GoodData Corporation
import { CalculationType } from "../../interfaces/index.js";

/**
 * @internal
 */
interface ICalculationDefaultValue {
    defaultLabelKey: string;
    defaultFormat: string;
}

const CALCULATION_VALUES_DEFAULT: { [key in CalculationType]?: ICalculationDefaultValue } = {
    [CalculationType.CHANGE]: {
        defaultLabelKey: "visualizations.headline.comparison.title.change",
        defaultFormat: "#,##0%",
    },
    [CalculationType.RATIO]: {
        defaultLabelKey: "visualizations.headline.comparison.title.ratio",
        defaultFormat: "#,##0%",
    },
    [CalculationType.DIFFERENCE]: {
        defaultLabelKey: "visualizations.headline.comparison.title.difference",
        defaultFormat: null,
    },
};

/**
 * Get comparison format
 *
 * @remarks
 * We offer the option to inherit the format with a null value. When the provided format is null,
 * it indicates the user's preference to utilize the inherit format.
 *
 * If the format is undefined, the default format will be used.
 *
 * @internal
 */
const getComparisonFormat = (providedFormat: string, defaultFormat: string): string => {
    return providedFormat === undefined ? defaultFormat : providedFormat;
};

/**
 * Method to retrieve default values corresponding to the calculation type.
 *
 * @internal
 */
const getCalculationValuesDefault = (
    calculationType: CalculationType = CalculationType.CHANGE,
): ICalculationDefaultValue => {
    return CALCULATION_VALUES_DEFAULT[calculationType];
};

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 */
export { getCalculationValuesDefault, getComparisonFormat, ICalculationDefaultValue };
