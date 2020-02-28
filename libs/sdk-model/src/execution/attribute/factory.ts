// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import cloneDeep = require("lodash/cloneDeep");
import isEmpty = require("lodash/isEmpty");
import { IAttribute, isAttribute } from "./index";
import { ObjRef, objRefToString, Identifier, isObjRef } from "../base";
import { idRef } from "../base/factory";
import SparkMD5 from "spark-md5";

type AttributeBuilderInput = Identifier | ObjRef | IAttribute;

/**
 * Builder for attributes.
 *
 * Do not instantiate this class directly. Instead use {@link newAttribute}.
 *
 * @public
 */
export class AttributeBuilder {
    private attribute: IAttribute["attribute"];
    private customLocalId: boolean = false;

    /**
     * @internal
     */
    constructor(input: AttributeBuilderInput) {
        if (isAttribute(input)) {
            this.attribute = cloneDeep(input.attribute);
            this.customLocalId = false;
        } else {
            const displayForm: ObjRef = isObjRef(input) ? input : idRef(input, "displayForm");

            this.attribute = {
                displayForm,
                localIdentifier: "",
            };
        }
    }

    public alias = (alias: string) => {
        this.attribute.alias = alias;

        return this;
    };

    public localId = (localId: string) => {
        this.attribute.localIdentifier = localId;
        this.customLocalId = true;

        return this;
    };

    public build = () => {
        const localIdentifier = this.getOrGenerateLocalId();

        return {
            attribute: {
                ...this.attribute,
                localIdentifier,
            },
        };
    };

    private getOrGenerateLocalId(): string {
        if (this.customLocalId && !isEmpty(this.attribute.localIdentifier)) {
            return this.attribute.localIdentifier;
        }

        return ["a", this.calculateAliasHash(), objRefToString(this.attribute.displayForm)]
            .filter(part => !isEmpty(part))
            .join("_");
    }

    private calculateAliasHash(): string {
        if (!this.attribute.alias) {
            return "";
        }

        const hasher = new SparkMD5();
        hasher.append(this.attribute.alias);

        return hasher.end().substr(0, 8);
    }
}

/**
 * Function that will be called to perform modifications of an attribute before it is fully constructed.
 *
 * @public
 */
export type AttributeModifications = (builder: AttributeBuilder) => AttributeBuilder;

/**
 * Creates a new attribute with the specified display form ref and optional modifications and localIdentifier.
 * @param displayFormRefOrId - ref or identifier of the attribute display form
 * @param modifications - optional modifications (e.g. alias, etc.)
 * @public
 */
export function newAttribute(
    displayFormRefOrId: ObjRef | Identifier,
    modifications: AttributeModifications = identity,
): IAttribute {
    const builder = new AttributeBuilder(displayFormRefOrId);

    return modifications(builder).build();
}

/**
 * Allows modification of an existing attribute instance.
 *
 * @param attribute - attribute to modify
 * @param modifications - modification function
 * @public
 */
export function modifyAttribute(
    attribute: IAttribute,
    modifications: AttributeModifications = identity,
): IAttribute {
    const builder = new AttributeBuilder(attribute);

    return modifications(builder).build();
}
