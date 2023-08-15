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
export { getCalculationValuesDefault, ICalculationDefaultValue };
