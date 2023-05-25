// (C) 2019-2022 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";
import stringify from "json-stable-stringify";

/**
 * Type for all identifiers.
 *
 * @public
 */
export type Identifier = string;

/**
 * Type for all URI's.
 *
 * @public
 */
export type Uri = string;

/**
 * Model object reference using object's URI.
 *
 * @remarks
 * NOTE: using URI references is discouraged. URIs are workspace-specific and thus any application
 * which references model objects using their URI will not work on multiple workspaces.
 *
 * @public
 */
export type UriRef = {
    uri: Uri;
};

/**
 * Metadata object types
 *
 * @public
 */
export type ObjectType =
    | "measure"
    | "fact"
    | "attribute"
    | "displayForm"
    | "dataSet"
    | "tag"
    | "insight"
    | "variable"
    | "analyticalDashboard"
    | "theme"
    | "colorPalette"
    | "filterContext"
    | "dashboardPlugin";

/**
 * Model object reference using object's unique identifier.
 *
 * NOTE: this is preferred way to reference model objects.
 *
 * @public
 */
export type IdentifierRef = {
    /**
     * Type of object being referenced.
     *
     * -  This field MUST be specified when working with backends which have identifiers unique on workspace+type level
     *    instead of the entire workspace level. Tiger backend requires this field.
     *
     * -  Backends with workspace-unique identifiers MUST ignore this field.
     *
     * Note: the best way to avoid this conundrum is to actually avoid manually creating/typing the object references.
     * The catalog-exporter tool is capable to generate code from your LDM and will create correct references - allowing
     * you to treat references opaquely. Same stands for the various services provided the backend-spi - reference-able
     * entities returned by backend-spi will typically have the 'ref' property that contains correct object reference.
     */
    type?: ObjectType;

    /**
     * The actual identifier.
     */
    identifier: Identifier;
};

/**
 * Model object reference using object's local identifier.
 *
 * @remarks
 * This type of referencing can be used for objects that are defined together within the same scope - such as within same execution.
 *
 * @public
 */
export type LocalIdRef = {
    localIdentifier: Identifier;
};

/**
 * Model object reference.
 *
 * @remarks
 * Note: you should avoid manually creating and maintaining object references. The recommended practice is to
 * treat your logical data model as code; you can achieve this by using the catalog-exporter tool which can
 * create code representation of the various LDM entities. You can then use this code in conjuction with the
 * various factory and builder methods in sdk-model to conveniently construct visualizations.
 *
 * @public
 */
export type ObjRef = UriRef | IdentifierRef;

/**
 * Model object reference with support of referencing objects living in the same scope using their
 * local identifier.
 *
 * @public
 */
export type ObjRefInScope = ObjRef | LocalIdRef;

//
// Type guards
//

/**
 * Type guard checking whether object is an URI Reference.
 *
 * @public
 */
export function isUriRef(obj: unknown): obj is UriRef {
    return !isEmpty(obj) && (obj as UriRef).uri !== undefined;
}

/**
 * Type guard checking whether object is an Identifier Reference.
 *
 * @public
 */
export function isIdentifierRef(obj: unknown): obj is IdentifierRef {
    return !isEmpty(obj) && (obj as IdentifierRef).identifier !== undefined;
}

/**
 * Type guard checking whether object is an Identifier Reference or an URI reference.
 *
 * @public
 */
export function isObjRef(obj: unknown): obj is ObjRef {
    return isUriRef(obj) || isIdentifierRef(obj);
}

/**
 * Type guard checking whether object is a localId Reference.
 *
 * @public
 */
export function isLocalIdRef(obj: unknown): obj is LocalIdRef {
    return !isEmpty(obj) && (obj as LocalIdRef).localIdentifier !== undefined;
}

/**
 * Retrieves string representation of object reference. This is purely for for representation of
 * references in text, debug and tests.
 *
 * @internal
 */
export function objRefToString(objRef: ObjRef | ObjRefInScope): string {
    invariant(objRef, "object reference must be specified");

    if (isIdentifierRef(objRef)) {
        return `${objRef.identifier}`;
    } else if (isUriRef(objRef)) {
        return objRef.uri;
    }

    return objRef.localIdentifier;
}

/**
 * Serializes an instance of ObjRef to a string representation.
 *
 * @remarks
 * This is suitable when ObjRef needs to be used as a key in dictionaries/objects.
 *
 * Note: there is no loss of information and the serialized value is guaranteed to be stable, meaning same ObjRef
 * will always serialize the same.
 *
 * @param objRef - ref to serialize
 * @remarks see {@link deserializeObjRef}
 * @public
 */
export function serializeObjRef(objRef: ObjRef | ObjRefInScope): string {
    return stringify(objRef, { space: 0 });
}

/**
 * Deserializes an ObjRef from its pure string representation.
 *
 * @remarks
 * The function will throw an error if the input is not a valid, serialized ObjRef.
 *
 * @param val - string representation of ObjRef
 * @remarks see {@link serializeObjRef}
 * @public
 */
export function deserializeObjRef(val: string): ObjRef | ObjRefInScope {
    const obj: unknown = JSON.parse(val);

    invariant(
        isObjRef(obj) || isLocalIdRef(obj),
        `Attempting to deserialize ObjRef but the input is invalid: '${val}'`,
    );

    return obj;
}

/**
 * Returns a value indicating whether the two ObjRef instances are semantically equal (i.e. are of the same type and have the same value).
 * Null and undefined are considered equal to each other.
 *
 * @remarks If the objects are ObjRefs of multiple types at once (for example they have identifiers and URIs),
 * the match is tested in the following sequence:
 * 1. identifier
 * 2. URI
 * 3. localIdentifier
 *
 * @public
 */
export function areObjRefsEqual<T extends ObjRefInScope | null | undefined>(a: T, b: T): boolean {
    if (a == null) {
        return b == null;
    }

    if (isIdentifierRef(a) && isIdentifierRef(b) && a.type && b.type) {
        return a.identifier === b.identifier && a.type === b.type;
    }

    if (isIdentifierRef(a) && isIdentifierRef(b)) {
        return a.identifier === b.identifier;
    }

    if (isUriRef(a) && isUriRef(b)) {
        return a.uri === b.uri;
    }

    return isLocalIdRef(a) && isLocalIdRef(b) && a.localIdentifier === b.localIdentifier;
}
