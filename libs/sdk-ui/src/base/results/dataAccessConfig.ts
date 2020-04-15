// (C) 2019-2020 GoodData Corporation
import { DataValue } from "@gooddata/sdk-backend-spi";
import { ISeparators, numberFormat } from "@gooddata/numberjs";
import isEmpty = require("lodash/isEmpty");

/**
 * @alpha
 */
export type ValueFormatter = (value: DataValue, format: string) => string;

/**
 * @alpha
 */
export type HeaderTranslator = (value: string) => string;

/**
 * Creates value formatter that uses @gooddata/numberjs to format raw measure values according
 * to the format string.
 *
 * @param separators - number separators to use. if not specified then numberjs defaults will be used
 * @alpha
 */
export function createNumberJsFormatter(separators?: ISeparators): ValueFormatter {
    return (value: DataValue, format: string) => {
        const valueToFormat = value === null && !isEmpty(format) ? "" : parseFloat(value as string);

        return numberFormat(valueToFormat, format, undefined, separators);
    };
}

/**
 * Default configuration for the data access methods. Uses default numberjs formatter and no result formatting.
 */
export const DefaultDataAccessConfig: DataAccessConfig = {
    valueFormatter: createNumberJsFormatter(),
};

/**
 * @alpha
 */
export type DataAccessConfig = {
    /**
     * Function to use to format measure values.
     */
    valueFormatter: ValueFormatter;

    /**
     * Function to translate header names.
     */
    headerTranslator?: HeaderTranslator;
};
