// (C) 2018 GoodData Corporation
import { getQualifierObject } from "./utils";
import {
    AttributeElements,
    IAbsoluteDateFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
} from "@gooddata/sdk-model";
import isArray = require("lodash/isArray");

// TODO prozkoumat call sites a zkusit se zbavit inValues: string, chceme asi jenom AttributeElements
export function positiveAttributeFilter(
    qualifier: string,
    inValues: string[] | AttributeElements,
    textFilter?: boolean,
): IPositiveAttributeFilter {
    if (!isArray(inValues)) {
        return {
            positiveAttributeFilter: {
                displayForm: getQualifierObject(qualifier),
                in: inValues as AttributeElements,
            },
        };
    }
    return {
        positiveAttributeFilter: {
            displayForm: getQualifierObject(qualifier),
            in: {
                ...(textFilter && { values: inValues }),
                ...(!textFilter && { uris: inValues }),
            },
        },
    };
}

export function negativeAttributeFilter(
    qualifier: string,
    notInValues: string[] | AttributeElements,
    textFilter?: boolean,
): INegativeAttributeFilter {
    if (!isArray(notInValues)) {
        return {
            negativeAttributeFilter: {
                displayForm: getQualifierObject(qualifier),
                notIn: notInValues as AttributeElements,
            },
        };
    }

    return {
        negativeAttributeFilter: {
            displayForm: getQualifierObject(qualifier),
            notIn: {
                ...(textFilter && { values: notInValues }),
                ...(!textFilter && { uris: notInValues }),
            },
        },
    };
}

export function absoluteDateFilter(dataSet: string, from?: string, to?: string): IAbsoluteDateFilter {
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
): IRelativeDateFilter {
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
    public in(...values: string[]): IPositiveAttributeFilter {
        return {
            positiveAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                in: { values },
            },
        };
    }

    /**
     * Creates a new negative attribute value filter for the specified display form. Attribute elements matching
     * the specified values will be excluded from the results.
     *
     * @param values textual values of the attribute elements
     */
    public notIn(...values: string[]): INegativeAttributeFilter {
        return {
            negativeAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                notIn: { values },
            },
        };
    }

    /**
     * Creates a new positive attribute URI filter for the specified display form. Attribute elements with the
     * specified URIs will be included in the results.
     *
     * @param uris URIs of attribute elements
     */
    public inUris(...uris: string[]): IPositiveAttributeFilter {
        return {
            positiveAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                in: { uris },
            },
        };
    }

    /**
     * Creates a new negative attribute URI filter for the specified display form. Attribute elements matching
     * the specified URIs will be excluded from the results.
     *
     * @param uris URIs of attribute elements
     */
    public notInUris(...uris: string[]): INegativeAttributeFilter {
        return {
            negativeAttributeFilter: {
                displayForm: getQualifierObject(this.qualifier),
                notIn: { uris },
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
