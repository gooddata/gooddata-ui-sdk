// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { IAttribute } from "./index";
import { ObjRef, objRefToString, Identifier, isObjRef } from "../base";
import { idRef } from "../base/factory";

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
    constructor(displayForm: ObjRef) {
        this.attribute = {
            displayForm,
            localIdentifier: `a_${objRefToString(displayForm)}`,
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
 * Creates a new attribute with the specified display form ref and optional modifications and localIdentifier.
 * @param displayForm - ref or identifier of the attribute display form
 * @param modifications - optional modifications (e.g. alias, etc.)
 * @public
 */
export function newAttribute(
    displayForm: ObjRef | Identifier,
    modifications: AttributeModifications = identity,
): IAttribute {
    const ref = isObjRef(displayForm) ? displayForm : idRef(displayForm);
    const builder = new AttributeBuilder(ref);
    return modifications(builder).build();
}
