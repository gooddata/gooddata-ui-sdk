// (C) 2019 GoodData Corporation
import identity = require("lodash/identity");
import { IAttribute } from ".";

class AttributeBuilder implements IAttribute {
    public attribute: IAttribute["attribute"];

    constructor(displayFormIdentifier: string, localIdentifier: string) {
        this.attribute = {
            displayForm: { identifier: displayFormIdentifier },
            localIdentifier,
        };
    }

    public alias = (alias: string) => {
        this.attribute.alias = alias;
        return this;
    };

    public localIdentifier = (localIdentifier: string) => {
        this.attribute.localIdentifier = localIdentifier;
        return this;
    };

    public build = () => {
        return { attribute: this.attribute };
    };
}

type AttributeModifications = (builder: AttributeBuilder) => AttributeBuilder;

/**
 * Creates a new attribute with the specified display form identifier and optional modifications and localIdentifier.
 * @param identifier - identifier of the attribute display form
 * @param modifications - optional modifications (e.g. alias, etc.)
 * @param localIdentifier - optional local identifier, defaults to 'a_$\{identifier\}'
 * @public
 */
export function newAttribute(
    identifier: string,
    modifications: AttributeModifications = identity,
    localIdentifier = `a_${identifier}`,
): IAttribute {
    const builder = new AttributeBuilder(identifier, localIdentifier);
    return modifications(builder).build();
}
