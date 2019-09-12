// (C) 2018 GoodData Corporation
import { VisualizationInput } from "@gooddata/typings";
import { getQualifierObject } from "./utils";

export function positiveAttributeFilter(
    qualifier: string,
    inValues: string[],
    textFilter?: boolean,
): VisualizationInput.IPositiveAttributeFilter {
    return {
        positiveAttributeFilter: {
            displayForm: getQualifierObject(qualifier),
            in: inValues,
            ...(textFilter && { textFilter }),
        },
    };
}

export function negativeAttributeFilter(
    qualifier: string,
    notInValues: string[],
    textFilter?: boolean,
): VisualizationInput.INegativeAttributeFilter {
    return {
        negativeAttributeFilter: {
            displayForm: getQualifierObject(qualifier),
            notIn: notInValues,
            ...(textFilter && { textFilter }),
        },
    };
}

export function absoluteDateFilter(
    dataSet: string,
    from?: string,
    to?: string,
): VisualizationInput.IAbsoluteDateFilter {
    return {
        absoluteDateFilter: {
            dataSet: getQualifierObject(dataSet),
            from,
            to,
        },
    };
}

export function relativeDateFilter(
    dataSet: string,
    granularity: string,
    from?: number,
    to?: number,
): VisualizationInput.IRelativeDateFilter {
    return {
        relativeDateFilter: {
            dataSet: getQualifierObject(dataSet),
            granularity,
            from,
            to,
        },
    };
}

export class AttributeFilterBuilder {
    constructor(private readonly qualifier: string) {
        this.qualifier = qualifier;
    }

    /**
     * Creates a new positive attribute value filter for the specified display form. Only attribute elements
     * matching the specified values will be included in the results.
     *
     * @param values textual values of the attribute elements
     */
    public in(...values: string[]): VisualizationInput.IPositiveAttributeFilter {
        return {
            positiveAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                in: values,
                textFilter: true,
            },
        };
    }

    /**
     * Creates a new negative attribute value filter for the specified display form. Attribute elements matching
     * the specified values will be excluded from the results.
     *
     * @param values textual values of the attribute elements
     */
    public notIn(...values: string[]): VisualizationInput.INegativeAttributeFilter {
        return {
            negativeAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                notIn: values,
                textFilter: true,
            },
        };
    }

    /**
     * Creates a new positive attribute URI filter for the specified display form. Attribute elements with the
     * specified URIs will be included in the results.
     *
     * @param uris URIs of attribute elements
     */
    public inUris(...uris: string[]): VisualizationInput.IPositiveAttributeFilter {
        return {
            positiveAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                in: uris,
                textFilter: false,
            },
        };
    }

    /**
     * Creates a new negative attribute URI filter for the specified display form. Attribute elements matching
     * the specified URIs will be excluded from the results.
     *
     * @param uris URIs of attribute elements
     */
    public notInUris(...uris: string[]): VisualizationInput.INegativeAttributeFilter {
        return {
            negativeAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                notIn: uris,
                textFilter: false,
            },
        };
    }
}

/**
 * Starts building a new attribute filter for the display for with the provided qualifier.
 *
 * @param qualifier URI or identifier of display form to filter on
 */
export function attributeFilter(qualifier: string): AttributeFilterBuilder {
    return new AttributeFilterBuilder(qualifier);
}
