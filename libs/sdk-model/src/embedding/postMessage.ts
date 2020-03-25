// (C) 2020 GoodData Corporation

/**
 * Data of the postMessage message used to activate drilling on specific measures and/or attributes.
 *
 * @public
 */
export interface IDrillingActivationPostMessageData {
    /**
     * URI of attribute or measure that should be drillable.
     */
    uris?: string[];

    /**
     * Identifier of attribute or measure that should be drillable.
     */
    identifiers?: string[];

    /**
     * Optionally specifies drilling on measures that are composed from other measures - by listing uris or
     * identifiers of components.
     */
    composedFrom?: IDrillingActivationPostMessageData;
}
