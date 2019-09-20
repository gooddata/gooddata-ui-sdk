// (C) 2018 GoodData Corporation
import { getQualifierObject } from "./utils";
import { IAttribute } from "@gooddata/sdk-model";

export class AttributeBuilder implements IAttribute {
    private static lastAttributeId = 0;
    public attribute: IAttribute["attribute"];

    constructor(displayForm: string) {
        this.attribute = {
            displayForm: getQualifierObject(displayForm),
            localIdentifier: `va_${AttributeBuilder.lastAttributeId++}`,
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
}

export const attribute = (displayForm: string) => new AttributeBuilder(displayForm);
