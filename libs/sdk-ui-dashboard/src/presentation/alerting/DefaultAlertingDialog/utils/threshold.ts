// (C) 2025 GoodData Corporation

import { ClientFormatterFacade } from "@gooddata/number-formatter";

export function convertThresholdValue(value: string, format?: string): number | undefined {
    const decimal = ".";
    const convertedValue = ClientFormatterFacade.convertValue(value);

    if (convertedValue === null || isNaN(convertedValue)) {
        return undefined;
    }

    try {
        const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, {
            decimal,
            thousand: "",
        });

        const rounding = convertRounding(formattedValue, decimal);
        return parseFloat(convertedValue.toFixed(rounding));
    } catch {
        const rounding = convertRounding(value, decimal);
        return parseFloat(convertedValue.toFixed(rounding));
    }
}

function convertRounding(formattedNumber: string, decimal: string): number | undefined {
    const cleanedString = formattedNumber.replace(/[^\d.-]/g, "");
    const rawNumber = parseFloat(cleanedString);

    if (isNaN(rawNumber)) {
        return 20;
    }

    const fractions = cleanedString.split(decimal)[1];
    return (fractions ?? "").length;
}
