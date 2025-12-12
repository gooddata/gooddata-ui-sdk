// (C) 2019-2025 GoodData Corporation
import { escape, unescape } from "lodash-es";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type DataValue, type ISeparators } from "@gooddata/sdk-model";

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
 * Creates value formatter that uses `@gooddata/number-formatter` to format raw measure values according
 * to the format string.
 *
 * @remarks
 * By default, the format will strip away all the coloring information and
 * just return the value as string.
 *
 * @param separators - number separators to use. if not specified then `numberjs` defaults will be used
 * @public
 */
export function createNumberJsFormatter(separators?: ISeparators): ValueFormatter {
    return (value: DataValue, format: string) => {
        const valueToFormat = ClientFormatterFacade.convertValue(value);
        const { formattedValue } = ClientFormatterFacade.formatValue(valueToFormat, format, separators);
        return customEscape(formattedValue);
    };
}

/**
 * Default configuration for the data access methods. Uses default `@gooddata/number-formatter` formatter and no result formatting.
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
