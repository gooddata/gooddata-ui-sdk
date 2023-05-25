// (C) 2019-2023 GoodData Corporation
import { DataValue } from "@gooddata/sdk-model";
import NumberJs from "@gooddata/numberjs";
import isEmpty from "lodash/isEmpty.js";
import escape from "lodash/escape.js";
import unescape from "lodash/unescape.js";

const customEscape = (str: string) => str && escape(unescape(str));

/**
 * @public
 */
export type ValueFormatter = (value: DataValue, format: string) => string;

/**
 * @public
 */
export type HeaderTranslator = (value: string | null) => string;

/**
 * Creates value formatter that uses `@gooddata/numberjs` to format raw measure values according
 * to the format string.
 *
 * @remarks
 * By default, the format will strip away all the coloring information and
 * just return the value as string.
 *
 * @param separators - number separators to use. if not specified then `numberjs` defaults will be used
 * @public
 */
export function createNumberJsFormatter(separators?: NumberJs.ISeparators): ValueFormatter {
    return (value: DataValue, format: string) => {
        const valueToFormat = value === null && !isEmpty(format) ? "" : parseFloat(value as string);

        const formattedValue = NumberJs.numberFormat(valueToFormat, format, undefined, separators);
        const formattedObject: NumberJs.INumberObject = NumberJs.colors2Object(formattedValue);

        return customEscape(formattedObject.label);
    };
}

/**
 * Default configuration for the data access methods. Uses default `@gooddata/numberjs` formatter and no result formatting.
 *
 * @public
 */
export const DefaultDataAccessConfig: DataAccessConfig = {
    valueFormatter: createNumberJsFormatter(),
};

/**
 * @public
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
