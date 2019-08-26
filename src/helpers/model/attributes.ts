// (C) 2018 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import { getQualifierObject } from "./utils";

export class AttributeBuilder implements VisualizationObject.IVisualizationAttribute {
    private static lastAttributeId = 0;
    public visualizationAttribute: VisualizationObject.IVisualizationAttribute["visualizationAttribute"];
    constructor(displayForm: string) {
        this.visualizationAttribute = {
            displayForm: getQualifierObject(displayForm),
            localIdentifier: `va_${AttributeBuilder.lastAttributeId++}`,
        };
    }

    public alias = (alias: string) => {
        this.visualizationAttribute.alias = alias;
        return this;
    };

    public localIdentifier = (localIdentifier: string) => {
        this.visualizationAttribute.localIdentifier = localIdentifier;
        return this;
    };
}

export const attribute = (displayForm: string) => new AttributeBuilder(displayForm);
