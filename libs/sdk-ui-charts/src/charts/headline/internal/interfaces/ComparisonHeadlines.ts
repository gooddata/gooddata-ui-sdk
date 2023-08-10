// (C) 2023 GoodData Corporation
import { CalculationType } from "../../../../interfaces/index.js";

export interface ICalculationDefaultValue {
    labelKey: string;
    format?: string;
}

export const CALCULATION_VALUES_DEFAULT: { [key in CalculationType]?: ICalculationDefaultValue } = {
    [CalculationType.CHANGE]: {
        labelKey: "visualizations.headline.comparison.title.change",
        format: "#,##0%",
    },
    [CalculationType.RATIO]: { labelKey: "visualizations.headline.comparison.title.ratio", format: "#,##0%" },
    [CalculationType.DIFFERENCE]: { labelKey: "visualizations.headline.comparison.title.difference" },
};
