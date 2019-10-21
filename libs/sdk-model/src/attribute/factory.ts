// (C) 2019 GoodData Corporation
import identity = require("lodash/identity");
import { IAttribute } from ".";

/**
 * Builder for attributes.
 *
 * Do not instantiate this class directly. Instead use {@link newAttribute}.
 *
 * @public
 */
export class AttributeBuilder implements IAttribute {
    public attribute: IAttribute["attribute"];

    /**
     * @internal
     */
    constructor(displayFormId: string) {
        this.attribute = {
            displayForm: { identifier: displayFormId },
            localIdentifier: `a_${displayFormId}`,
        };
    }

    public alias = (alias: string) => {
        this.attribute.alias = alias;
        return this;
    };

    public localId = (localId: string) => {
        this.attribute.localIdentifier = localId;
        return this;
    };

    public build = () => {
        return { attribute: this.attribute };
    };
}

/**
 * Function that will be called to perform modifications of an attribute before it is fully constructed.
 *
 * @public
 */
export type AttributeModifications = (builder: AttributeBuilder) => AttributeBuilder;

/**
 * Creates a new attribute with the specified display form identifier and optional modifications and localIdentifier.
 * @param displayFormId - identifier of the attribute display form
 * @param modifications - optional modifications (e.g. alias, etc.)
 * @public
 */
export function newAttribute(
    displayFormId: string,
    modifications: AttributeModifications = identity,
): IAttribute {
    const builder = new AttributeBuilder(displayFormId);
    return modifications(builder).build();
}
